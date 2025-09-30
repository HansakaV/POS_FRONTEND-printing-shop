import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signUp } from "../services/authService"
import toast from "react-hot-toast"
import axios from "axios"

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: "admin" | "user"
  secret: string
  branch: "DPHeadbranch" | "DPSubBranch"
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  secret?: string
  branch?: string
}

const Signup = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    secret: "",
    branch: "DPHeadbranch",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 2) {
      newErrors.username = "Username must be at least 2 characters"
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    // Secret validation (only for admin)
    if (formData.role === "admin") {
      if (!formData.secret) {
        newErrors.secret = "Secret is required for admin users"
      } else if (formData.secret !== "dp@123") {
        newErrors.secret = "Invalid admin secret"
      }
    }

    // Branch validation
    if (!formData.branch) {
      newErrors.branch = "Branch is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        const submitData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          branch: formData.branch,
          ...(formData.role === "admin" && { secret: formData.secret })
        }
        console.log("Submitting data:", submitData)
        await signUp(submitData)
        toast.success("Signup successful! Please login.")
        navigate("/login")
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message)
        } else {
          toast.error("Something went wrong")
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when user starts typing/selecting
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }

    // Clear secret when role changes to user
    if (name === "role" && value === "user") {
      setFormData((prev) => ({
        ...prev,
        secret: "",
      }))
      if (errors.secret) {
        setErrors((prev) => ({
          ...prev,
          secret: undefined,
        }))
      }
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Create your account</h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='username' className='block text-sm font-medium text-gray-700'>
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                value={formData.username}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.username ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder='Enter your username'
              />
              {errors.username && <p className='mt-1 text-sm text-red-600'>{errors.username}</p>}
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder='Enter your email'
              />
              {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email}</p>}
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder='Enter your password'
              />
              {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password}</p>}
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                Confirm Password
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder='Confirm your password'
              />
              {errors.confirmPassword && <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor='role' className='block text-sm font-medium text-gray-700'>
                Role
              </label>
              <select
                id='role'
                name='role'
                value={formData.role}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.role ? "border-red-300" : "border-gray-300"
                } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              >
                <option value='user'>User</option>
                <option value='admin'>Admin</option>
              </select>
              {errors.role && <p className='mt-1 text-sm text-red-600'>{errors.role}</p>}
            </div>

            {formData.role === "admin" && (
              <div>
                <label htmlFor='secret' className='block text-sm font-medium text-gray-700'>
                  Admin Secret
                </label>
                <input
                  id='secret'
                  name='secret'
                  type='password'
                  value={formData.secret}
                  onChange={handleChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.secret ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder='Enter admin secret'
                />
                {errors.secret && <p className='mt-1 text-sm text-red-600'>{errors.secret}</p>}
              </div>
            )}

            <div>
              <label htmlFor='branch' className='block text-sm font-medium text-gray-700'>
                Branch
              </label>
              <select
                id='branch'
                name='branch'
                value={formData.branch}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.branch ? "border-red-300" : "border-gray-300"
                } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              >
                <option value='DPHeadbranch'>DP Head Branch</option>
                <option value='DPSubBranch'>DP Sub Branch</option>
              </select>
              {errors.branch && <p className='mt-1 text-sm text-red-600'>{errors.branch}</p>}
            </div>
          </div>

          <div>
            <button
              disabled={isLoading}
              type='submit'
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {!isLoading ? "Sign up" : "Signing up..."}
            </button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Already have an account?{" "}
              <Link
                to='/login'
                className='font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150'
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup