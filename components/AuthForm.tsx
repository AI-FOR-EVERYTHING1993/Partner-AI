"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthFormProps {
  type: 'sign-in' | 'sign-up'
}

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  preferredName: z.string().optional(),
  profileImage: z.instanceof(File, "Please upload a valid image file").optional(),
})

const AuthForm = ({ type }: AuthFormProps) => {
  // You can change these to match your company branding
  const companyLogo = "public\\logo-image.jpg" // <-- Replace this with your logo
  const companyName = "Partner AI"

  if (type === 'sign-up') {
    const form = useForm<z.infer<typeof signUpSchema>>({
      resolver: zodResolver(signUpSchema),
      defaultValues: {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        preferredName: "",
      },
    })

    const onSubmit = (data: z.infer<typeof signUpSchema>) => {
      console.log("Form Data:", data)
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              className="w-16 h-16 rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {companyName}
          </CardTitle>
          <CardDescription>
            Get the job of your dreams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="preferredName">Preferred Name (Optional)</Label>
              <Input {...form.register("preferredName")} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input {...form.register("email")} type="email" />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input {...form.register("password")} type="password" />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="profileImage">Profile Image (Optional)</Label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  form.setValue("profileImage", file);
                }}
              />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    console.log(data)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src={companyLogo} 
            alt="Company Logo" 
            className="w-16 h-16 rounded-full"
          />
        </div>
        <CardTitle className="text-2xl font-bold">
          {companyName}
        </CardTitle>
        <CardDescription>
          Welcome back
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input {...form.register("email")} type="email" />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input {...form.register("password")} type="password" />
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AuthForm