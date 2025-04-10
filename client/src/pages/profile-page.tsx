import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AIRecommendations from "@/components/recommendations/ai-recommendations";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Building, Mail, Phone, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
  companyLogo: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      companyName: user?.companyName || "",
      companyDescription: user?.companyDescription || "",
      companyLogo: user?.companyLogo || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("User not found");
      
      const res = await apiRequest("PUT", `/api/users/${user.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p>Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your personal information and account settings</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="personal">Personal Information</TabsTrigger>
                    {user.userType === "company" && (
                      <TabsTrigger value="company">Company Details</TabsTrigger>
                    )}
                  </TabsList>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <TabsContent value="personal" className="space-y-6">
                        <div className="flex items-center mb-6">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                            <User className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-lg">{user.fullName}</h2>
                            <p className="text-sm text-gray-500">
                              {user.userType === "company" ? "Rental Company" : "Client"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your phone number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Used for booking confirmations and emergency contact
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-medium">Address Information</h3>

                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your street address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="City" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Province</FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value || ""}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a province" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Kigali">Kigali</SelectItem>
                                        <SelectItem value="Northern">Northern</SelectItem>
                                        <SelectItem value="Southern">Southern</SelectItem>
                                        <SelectItem value="Eastern">Eastern</SelectItem>
                                        <SelectItem value="Western">Western</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Zip/Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Zip/Postal Code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {user.userType === "company" && (
                          <div className="py-4 px-4 bg-blue-50 rounded-md flex items-start text-blue-700">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Company Information</p>
                              <p className="text-sm">
                                To update your company details, please navigate to the Company Details tab.
                              </p>
                              <Button
                                variant="link"
                                className="h-auto p-0 text-blue-700"
                                onClick={() => setActiveTab("company")}
                              >
                                Go to Company Details
                              </Button>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {user.userType === "company" && (
                        <TabsContent value="company" className="space-y-6">
                          <div className="flex items-center mb-6">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <Building className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <h2 className="font-semibold text-lg">Company Profile</h2>
                              <p className="text-sm text-gray-500">
                                Manage your company information and branding
                              </p>
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your company name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="companyDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Brief description of your company"
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  This will be displayed to customers browsing your vehicles
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="companyLogo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Logo URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter logo URL" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Provide a URL to your company logo (recommended size: 200x200px)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-medium mb-2">Contact Information</h3>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {user.companyLogo && (
                              <div>
                                <h3 className="font-medium mb-2">Logo Preview</h3>
                                <div className="h-24 w-24 border rounded overflow-hidden">
                                  <img
                                    src={user.companyLogo}
                                    alt={`${user.companyName} logo`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "https://placehold.co/200x200?text=Logo";
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      )}

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </Tabs>
              </CardContent>
            </Card>

            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Personalized Recommendations</h2>
              <p className="text-gray-600 mb-6">Based on your profile and preferences, here are some vehicles you might like.</p>
              <AIRecommendations />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
