"use client"

import Link from "next/link"
import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { LockIcon, MailIcon, UserIcon } from "lucide-react"

export default function Component() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    localStorage.setItem("email", email)
    router.push("/patient_history")
  }

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12 bg-gradient-to-br from-indigo-100 to-white">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-indigo-800">Welcome Back</h1>
            <p className="text-balance text-indigo-600">
              Enter your credentials to access your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-indigo-700">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-indigo-700">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Login
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-700 opacity-20"></div>
        <div className="relative z-10 text-white text-center p-8">
          {/*
          <h2 className="text-4xl font-bold mb-4">Welcome to HealthConnect</h2>
          <p className="text-xl mb-8">Empowering healthcare professionals with seamless patient management</p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {[
              { icon: UserIcon, text: "Manage Patients" },
              { icon: MailIcon, text: "Secure Messaging" },
              { icon: LockIcon, text: "Data Protection" },
              { icon: UserIcon, text: "Collaborative Care" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center bg-indigo-500 p-4 rounded-lg">
                <item.icon className="w-8 h-8 mb-2" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          */}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-indigo-800 to-transparent"></div>
      </div>
    </div>
  )
}
