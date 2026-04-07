"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRightLeft, RefreshCw } from "lucide-react"

const POPULAR_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
]

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState<string>("1000")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("INR")
  const [result, setResult] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchRate = async () => {
    if (fromCurrency === toCurrency) {
      setRate(1)
      setResult(parseFloat(amount) || 0)
      setLastUpdated(new Date().toLocaleString())
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = `https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      console.log("[v0] Fetching from:", url)
      const res = await fetch(url)
      console.log("[v0] Response status:", res.status)
      
      if (!res.ok) {
        const text = await res.text()
        console.log("[v0] Response text:", text)
        throw new Error(`HTTP ${res.status}: Failed to fetch rates`)
      }
      
      const data = await res.json()
      console.log("[v0] Rate data:", data)
      
      const fetchedRate = data.rates[toCurrency]
      if (!fetchedRate) {
        throw new Error("Rate not found in response")
      }
      
      setRate(fetchedRate)
      setResult((parseFloat(amount) || 0) * fetchedRate)
      setLastUpdated(new Date().toLocaleString())
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error("[v0] Exchange rate error:", errorMsg, err)
      setError("Failed to fetch exchange rates. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRate()
  }, [fromCurrency, toCurrency])

  useEffect(() => {
    if (rate !== null) {
      setResult((parseFloat(amount) || 0) * rate)
    }
  }, [amount, rate])

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const getCurrencySymbol = (code: string) => {
    return POPULAR_CURRENCIES.find((c) => c.code === code)?.symbol || code
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Currency Converter</h1>
        <p className="text-muted-foreground">
          Convert between currencies using live exchange rates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Converter Card */}
        <Card>
          <CardHeader>
            <CardTitle>Convert</CardTitle>
            <CardDescription>Enter an amount to convert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-lg"
              />
            </div>

            {/* Currency Selectors */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{currency.code}</span>
                          <span className="text-muted-foreground text-sm">
                            {currency.name}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="shrink-0"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 space-y-2">
                <Label>To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{currency.code}</span>
                          <span className="text-muted-foreground text-sm">
                            {currency.name}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={fetchRate}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Rates
            </Button>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>
              {lastUpdated && `Last updated: ${lastUpdated}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Conversion Result */}
            <div className="rounded-lg bg-muted/50 p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {getCurrencySymbol(fromCurrency)} {formatNumber(parseFloat(amount) || 0)} {fromCurrency}
              </p>
              <p className="text-3xl font-bold">
                {getCurrencySymbol(toCurrency)} {result !== null ? formatNumber(result) : "—"}
              </p>
              <p className="text-lg font-medium text-muted-foreground">{toCurrency}</p>
            </div>

            {/* Exchange Rate */}
            {rate !== null && (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-medium">
                    1 {fromCurrency} = {formatNumber(rate)} {toCurrency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Inverse Rate</span>
                  <span className="font-medium">
                    1 {toCurrency} = {formatNumber(1 / rate)} {fromCurrency}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Amounts */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Quick amounts</Label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    className={amount === quickAmount.toString() ? "border-primary" : ""}
                  >
                    {quickAmount}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Exchange rates are provided by{" "}
            <a
              href="https://www.frankfurter.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Frankfurter API
            </a>
            {" "}and are updated daily from the European Central Bank.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
