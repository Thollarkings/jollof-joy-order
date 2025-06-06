import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import emailjs from '@emailjs/browser';

interface PaymentData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  phone: string;
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderData = location.state?.orderData;
  const customerInfo = location.state?.customerInfo;
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardholderName: customerInfo?.name || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: customerInfo?.address || '',
    phone: customerInfo?.phone || ''
  });
  
  const [errors, setErrors] = useState<Partial<PaymentData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    emailjs.init('VvF5HuAWU3b9UV75I');
  }, []);

  useEffect(() => {
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      navigate('/order');
    }
  }, [orderData, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCardForm = () => {
    const newErrors: Partial<PaymentData> = {};
    
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    const cardNumberClean = paymentData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length < 15 || cardNumberClean.length > 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!paymentData.expiryDate || paymentData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!paymentData.cvv || paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!paymentData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }
    
    if (!paymentData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDeliveryForm = () => {
    const newErrors: Partial<PaymentData> = {};
    
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Name is required';
    }
    
    if (!paymentData.billingAddress.trim()) {
      newErrors.billingAddress = 'Delivery address is required';
    }
    
    if (!paymentData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    
    setPaymentData(prev => ({ ...prev, [field]: formattedValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const sendOrderConfirmationEmail = async () => {
    const serviceID = 'service_nhkj0mp';
    const templateID = 'template_r7qndos';

    const orderItemsText = orderData.items.map((item: any) => 
      `${item.name} (${item.size}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const templateParams = {
      title: orderItemsText,
      name: paymentData.cardholderName,
      email: customerInfo?.email || 'customer@example.com',
      processing_time: `within one hour`,
      message: `Order Confirmation - Payment on Delivery

Order Details:
${orderItemsText}

Total: $${orderData.total.toFixed(2)}
Payment Method: Payment on Delivery
Phone: ${paymentData.phone}
Delivery Address: ${paymentData.billingAddress}

Your order has been confirmed and will be prepared for delivery. Payment will be collected upon delivery.

Thank you for choosing JaduPoint!`
    };

    return emailjs.send(serviceID, templateID, templateParams);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'card' && !validateCardForm()) {
      return;
    }
    
    if (paymentMethod === 'delivery' && !validateDeliveryForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'delivery') {
        await sendOrderConfirmationEmail();
        
        alert('Order confirmed! You will receive a confirmation email shortly. Payment will be collected upon delivery.');
        navigate('/');
      } else {
        setTimeout(() => {
          setIsProcessing(false);
          alert('Payment page completed! (Card payment processing not implemented yet)');
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      alert('Order confirmed but failed to send confirmation email. Please contact us if you need assistance.');
      navigate('/');
    }
    
    if (paymentMethod === 'delivery') {
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-r from-black via-coral-900 to-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/checkout')}
            className="text-gray-300 hover:text-white p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold text-white">Complete Your Payment</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {orderData.items.map((item: any) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{item.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">{item.size}</p>
                    <p className="text-coral-400 font-semibold">
                      ${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total:</span>
                <span className="text-2xl font-bold text-coral-400">${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Payment Information</h2>
            
            <form onSubmit={handlePayment} className="space-y-4">
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-3">Payment Method</label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="card" id="card" className="border-white/20 text-coral-400" />
                    <label htmlFor="card" className="text-white cursor-pointer">Credit/Debit Card</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="delivery" id="delivery" className="border-white/20 text-coral-400" />
                    <label htmlFor="delivery" className="text-white cursor-pointer">Payment on Delivery</label>
                  </div>
                </RadioGroup>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-gray-300 mb-2">
                  {paymentMethod === 'card' ? 'Cardholder Name *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className={`w-full p-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 ${
                    errors.cardholderName ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder={paymentMethod === 'card' ? 'Enter cardholder name' : 'Enter your full name'}
                  autoComplete="name"
                />
                {errors.cardholderName && (
                  <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>
                )}
              </div>

              {/* Phone Number (always shown) */}
              <div>
                <label className="block text-gray-300 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={paymentData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full p-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 ${
                    errors.phone ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your phone number"
                  required
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Card Details (only shown for card payment) */}
              {paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-2">Card Number *</label>
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className={`w-full p-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 ${
                        errors.cardNumber ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      autoComplete="cc-number"
                    />
                    {errors.cardNumber && (
                      <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        value={paymentData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className={`w-full p-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 ${
                          errors.expiryDate ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="MM/YY"
                        maxLength={5}
                        autoComplete="cc-exp"
                      />
                      {errors.expiryDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">CVV *</label>
                      <input
                        type="password"
                        value={paymentData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className={`w-full p-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 ${
                          errors.cvv ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="123"
                        maxLength={4}
                        autoComplete="cc-csc"
                      />
                      {errors.cvv && (
                        <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {/* Address */}
              <div>
                <label className="block text-gray-300 mb-2">
                  {paymentMethod === 'card' ? 'Billing Address *' : 'Delivery Address *'}
                </label>
                <textarea
                  value={paymentData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  className={`w-full p-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 h-24 resize-none ${
                    errors.billingAddress ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder={paymentMethod === 'card' ? 'Enter your billing address' : 'Enter your delivery address'}
                  autoComplete={paymentMethod === 'card' ? 'billing street-address' : 'shipping street-address'}
                />
                {errors.billingAddress && (
                  <p className="text-red-400 text-sm mt-1">{errors.billingAddress}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-coral text-lg py-4"
                disabled={isProcessing}
              >
                {isProcessing ? 
                  (paymentMethod === 'card' ? 'Processing Payment...' : 'Confirming Order...') : 
                  (paymentMethod === 'card' ? `Pay Now - $${orderData.total.toFixed(2)}` : `Confirm Order - $${orderData.total.toFixed(2)}`)
                }
              </Button>
            </form>
            
            <div className="flex items-center justify-center mt-4 text-gray-400 text-sm">
              <span className="mr-2">🔒</span>
              {paymentMethod === 'card' ? 'Secure Payment - Your data is safe' : 'Secure Order - Payment on delivery'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;