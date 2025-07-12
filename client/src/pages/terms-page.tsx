import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-none shadow-none">
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-2">Sirenda Platform – Terms and Conditions</h1>
              <p className="text-gray-600 mb-8">Effective Date: 08.05.2025</p>

              <div className="prose prose-gray max-w-none">
                <p className="mb-6">
                  Welcome to Sirenda, a digital platform operated by Sirenda Tech Limited ("we", "us", or "our") that connects individuals or businesses looking to rent vehicles ("Users" or "Renters") with vehicle owners ("Owners").
                </p>
                <p className="mb-8">
                  By creating an account, browsing, listing, booking, or otherwise using the Sirenda platform (the "Platform"), you agree to be bound by these Terms and Conditions ("Terms").
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">1. Definitions</h2>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>"Platform" refers to the Sirenda website or app.</li>
                  <li>"User" or "Renter" refers to a person booking a car through Sirenda.</li>
                  <li>"Owner" refers to a person or company listing a vehicle on Sirenda.</li>
                  <li>"Booking" means a confirmed rental request made through the Platform.</li>
                  <li>"Vehicle" refers to the car listed or rented.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">2. Eligibility</h2>
                <p className="mb-4">You must:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Be at least 18 years old (or the legal driving age in your country).</li>
                  <li>Hold a valid driver's license.</li>
                  <li>Provide accurate, complete account details.</li>
                  <li>Comply with all traffic and vehicle laws during rentals.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
                <p className="mb-4">You must register an account to use most Platform features. You are responsible for:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Keeping your login credentials secure.</li>
                  <li>Updating your personal information.</li>
                  <li>Notifying us of unauthorized account use.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Section A – Terms for Renters (Users)</h2>

                <h3 className="text-xl font-semibold mt-6 mb-4">4. Booking a Vehicle</h3>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>You agree to pay the full rental amount, including any applicable service or insurance fees.</li>
                  <li>Bookings are confirmed upon payment.</li>
                  <li>Cancellation and refund policies apply based on our cancellation policy.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-4">5. Use of Vehicle</h3>
                <p className="mb-4">You must treat the vehicle with care and return it on time.</p>
                <p className="mb-4">You are responsible for:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Traffic violations</li>
                  <li>Damage to the vehicle during the rental</li>
                  <li>Fuel, tolls, and any late return penalties</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-4">6. Prohibited Use</h3>
                <p className="mb-4">You must NOT:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Use the vehicle for illegal activities</li>
                  <li>Sublet or re-rent the vehicle</li>
                  <li>Drive under the influence</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Section B – Terms for Owners (Car Providers)</h2>

                <h3 className="text-xl font-semibold mt-6 mb-4">7. Listing a Vehicle</h3>
                <p className="mb-4">You must provide accurate details and photos.</p>
                <p className="mb-4">Your vehicle must:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Be insured and roadworthy</li>
                  <li>Be registered in your name or with proper authorization</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-4">8. Owner Responsibilities</h3>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Make the vehicle available at the agreed time.</li>
                  <li>Maintain the vehicle in good condition.</li>
                  <li>Report any incidents or disputes immediately.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-4">9. Earnings and Payouts</h3>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>We will deduct platform service fees before payouts.</li>
                  <li>Payouts will be made via the selected method after the rental is completed.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">10. Fees and Payment</h2>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>We may charge service, insurance, or cancellation fees.</li>
                  <li>All payments are processed securely through a third-party provider.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">11. Liability & Disclaimer</h2>
                <p className="mb-4">Sirenda is a marketplace: We do not own, operate, or maintain the vehicles listed.</p>
                <p className="mb-4">We are not responsible for:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Accidents, breakdowns, or disputes between users</li>
                  <li>Delays or damages during rentals</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">12. Disputes</h2>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Users should attempt to resolve issues directly.</li>
                  <li>We may step in to mediate but do not guarantee a resolution.</li>
                  <li>Legal claims will be handled under the laws of Rwanda.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">13. Termination</h2>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>We reserve the right to suspend or delete any account for violations of these Terms.</li>
                  <li>You may delete your account at any time, but prior bookings or obligations still apply.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">14. Updates to Terms</h2>
                <p className="mb-8">
                  We may modify these Terms at any time. We will notify users by email or platform notice. Continued use of the Platform means you accept the changes.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">15. Contact</h2>
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <p className="font-semibold">Sirenda Tech Limited</p>
                  <p>Email: support@sirenda.rw</p>
                  <p>Address: 1 KN 78 St, Kigali</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 