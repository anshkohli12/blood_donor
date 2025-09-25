"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(url, options)
        setData(response.data)
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchData()
    }
  }, [url])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(url, options)
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}
