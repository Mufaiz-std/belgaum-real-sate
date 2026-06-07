interface CashfreeCheckoutOptions {
  paymentSessionId: string
  redirectTarget?: '_self' | '_blank' | '_top' | '_modal' | string | HTMLElement
}

interface CashfreeInstance {
  checkout(options: CashfreeCheckoutOptions): Promise<void>
}

interface CashfreeConstructor {
  (config: { mode: string }): CashfreeInstance
}

interface Window {
  Cashfree?: CashfreeConstructor
}
