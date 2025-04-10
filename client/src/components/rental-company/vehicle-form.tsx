import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { insertVehicleSchema, Vehicle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Image, Upload, X } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const extendedVehicleSchema = insertVehicleSchema
  .omit({ ownerId: true })
  .extend({
    imageUrl: z.string().url("Please enter a valid URL").optional(),
    pricePerDay: z.coerce.number().positive("Price must be positive"),
    seats: z.coerce.number().positive("Seats must be positive"),
    bags: z.coerce.number().nonnegative("Bags must be non-negative").optional(),
    year: z.coerce.number().positive("Year must be positive"),
    categoryId: z.coerce.number().positive("Please select a category"),
  });

type VehicleFormValues = z.infer<typeof extendedVehicleSchema>;

interface VehicleFormProps {
  vehicle?: Vehicle;
  isEdit?: boolean;
}

export default function VehicleForm({ vehicle, isEdit = false }: VehicleFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(extendedVehicleSchema),
    defaultValues: isEdit && vehicle
      ? {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          description: vehicle.description,
          seats: vehicle.seats,
          bags: vehicle.bags,
          transmission: vehicle.transmission,
          fuel: vehicle.fuel,
          pricePerDay: vehicle.pricePerDay,
          location: vehicle.location,
          categoryId: vehicle.categoryId,
          isFeatured: vehicle.isFeatured,
          availability: vehicle.availability,
          imageUrl: (vehicle.imageUrls && vehicle.imageUrls[0] as string) || "",
        }
      : {
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          licensePlate: "",
          description: "",
          seats: 4,
          bags: 2,
          transmission: "automatic",
          fuel: "petrol",
          pricePerDay: 0,
          location: "",
          categoryId: 0,
          isFeatured: false,
          availability: true,
          imageUrl: "",
        },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      // Prepare image URLs array
      const imageUrls = data.imageUrl ? [data.imageUrl] : [];
      const vehicleData = {
        ...data,
        ownerId: user?.id,
        imageUrls
      };
      
      delete vehicleData.imageUrl;
      
      const res = await apiRequest(
        "POST",
        "/api/vehicles",
        vehicleData
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-vehicles'] });
      toast({
        title: "Vehicle created",
        description: "Your vehicle has been created successfully.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      if (!vehicle) throw new Error("Vehicle not found");
      
      // Prepare image URLs array
      const imageUrls = data.imageUrl ? [data.imageUrl] : [];
      const vehicleData = {
        ...data,
        imageUrls
      };
      
      delete vehicleData.imageUrl;
      
      const res = await apiRequest(
        "PUT",
        `/api/vehicles/${vehicle.id}`,
        vehicleData
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-vehicles'] });
      toast({
        title: "Vehicle updated",
        description: "Your vehicle has been updated successfully.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('image', file);
    
    setIsUploading(true);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      
      // Set the upload URL as both state and in the form
      const imageUrl = `${window.location.origin}${result.filePath}`;
      setUploadedImageUrl(imageUrl);
      form.setValue('imageUrl', imageUrl);
      
      toast({
        title: 'Image uploaded',
        description: 'Image has been uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const clearUploadedImage = () => {
    setUploadedImageUrl(null);
    form.setValue('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  function onSubmit(data: VehicleFormValues) {
    if (isEdit && vehicle) {
      updateVehicleMutation.mutate(data);
    } else {
      createVehicleMutation.mutate(data);
    }
  }

  const isPending = createVehicleMutation.isPending || updateVehicleMutation.isPending;

  if (!user || user.userType !== 'company') {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Access Denied</h2>
          <p className="mb-4">Only rental companies can add or edit vehicles.</p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Mercedes-Benz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="AMG GT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    disabled={isCategoriesLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seats</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bags</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Number of bags that fit in the vehicle</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transmission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transmission</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Per Day ($)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kigali, RW">Kigali, RW</SelectItem>
                      <SelectItem value="Musanze, RW">Musanze, RW</SelectItem>
                      <SelectItem value="Rubavu, RW">Rubavu, RW</SelectItem>
                      <SelectItem value="Karongi, RW">Karongi, RW</SelectItem>
                      <SelectItem value="Rusizi, RW">Rusizi, RW</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Vehicle Image</FormLabel>
                  <div className="space-y-4">
                    {/* Upload button and preview section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleUploadButtonClick}
                          className="w-full h-12"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                        
                        <div className="mt-2">
                          <FormControl>
                            <Input placeholder="or enter image URL directly" {...field} />
                          </FormControl>
                          <FormDescription>
                            Upload an image or provide a direct URL
                          </FormDescription>
                        </div>
                      </div>
                      
                      {/* Image preview */}
                      <div className="border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center relative">
                        {(uploadedImageUrl || field.value) ? (
                          <>
                            <img
                              src={uploadedImageUrl || field.value}
                              alt="Vehicle preview"
                              className="w-full h-full object-cover"
                              style={{ maxHeight: '150px' }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={clearUploadedImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center py-10">
                            <Image className="h-10 w-10 mb-2" />
                            <span>No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the vehicle..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available for booking</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured vehicle</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Vehicle" : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
