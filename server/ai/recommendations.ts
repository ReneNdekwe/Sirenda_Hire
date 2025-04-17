import OpenAI from "openai";
import { Vehicle, User, Category, Booking } from "@shared/schema";

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import { CONFIG } from '../config';

const openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });

// Define the recommendation result type
export interface RecommendationResult {
  vehicleId: number;
  score: number;
  reason: string;
}

/**
 * Generates personalized vehicle recommendations based on user profile, preferences, and booking history
 */
export async function generateVehicleRecommendations(
  user: User,
  availableVehicles: Vehicle[],
  userBookings: Booking[],
  categories: Category[],
  limit: number = 3
): Promise<RecommendationResult[]> {
  if (!availableVehicles.length) {
    return [];
  }

  try {
    // Prepare user profile and booking history data
    const userProfile = {
      userType: user.userType,
      bookingHistory: userBookings.map(booking => ({
        vehicleId: booking.vehicleId,
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        status: booking.status
      })),
      // Include additional user preferences if we had them
    };

    // Prepare available vehicles data
    const vehiclesData = availableVehicles.map(vehicle => {
      const category = categories.find(c => c.id === vehicle.categoryId);
      return {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        category: category?.name || "Unknown",
        seats: vehicle.seats,
        transmission: vehicle.transmission,
        fuel: vehicle.fuel,
        features: vehicle.features,
        pricePerDay: vehicle.pricePerDay,
        location: vehicle.location,
        rating: vehicle.rating,
        reviewCount: vehicle.reviewCount
      };
    });

    // Previously booked vehicle ids for context
    const bookedVehicleIds = userBookings.map(b => b.vehicleId);

    // Structure the prompt for OpenAI
    const prompt = `
    As an AI car rental recommendation expert, analyze the user's profile and booking history to suggest the most suitable vehicles.
    
    User Profile:
    ${JSON.stringify(userProfile, null, 2)}
    
    Available Vehicles:
    ${JSON.stringify(vehiclesData, null, 2)}
    
    Previously booked vehicle IDs (if any):
    ${JSON.stringify(bookedVehicleIds, null, 2)}
    
    Based on this information, recommend the top ${limit} vehicles that would best match this user's preferences and needs.
    For each recommendation, provide a score between 0 and 1 indicating how strongly you recommend it, and a brief reason.
    
    Return the recommendations as a JSON array with objects containing:
    - vehicleId: The ID of the recommended vehicle
    - score: A number between 0 and 1 indicating confidence
    - reason: A brief explanation of why this vehicle is recommended
    
    Make your recommendations diverse but relevant.
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a vehicle recommendation expert for a car rental platform." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("Empty response from OpenAI API");
      return [];
    }

    const parsedResponse = JSON.parse(content);
    
    // Ensure we have recommendations array
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      console.error("Invalid recommendations format:", parsedResponse);
      return [];
    }

    // Process and validate recommendations
    const recommendations = parsedResponse.recommendations
      .filter((rec: any) => 
        typeof rec.vehicleId === 'number' && 
        typeof rec.score === 'number' && 
        typeof rec.reason === 'string'
      )
      .map((rec: any) => ({
        vehicleId: rec.vehicleId,
        score: Math.min(1, Math.max(0, rec.score)), // Ensure score is between 0 and 1
        reason: rec.reason.trim()
      }))
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return [];
  }
}