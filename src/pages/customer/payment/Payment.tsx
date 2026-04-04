import { CreditCard, Building2, Wallet, QrCode, Check, ShieldCheck, Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Payment = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMakePayment = () => {
    // Add payment processing logic here
    console.log('Processing payment with method:', selectedMethod);
    console.log('Card details:', cardDetails);
    // Navigate to confirmation page after successful payment
    // navigate('/booking/confirmation');
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Visa / Mastercard',
      description: 'Pay securely with your credit or debit card. Supports 3D Secure verification.',
      icon: CreditCard,
      color: 'from-red-50 to-red-100 border-red-200'
    },
    {
      id: 'atm',
      name: 'ATM Transfer',
      description: 'Direct bank transfer via local ATM networks or online banking portals.',
      icon: Building2,
      color: 'from-blue-50 to-blue-100 border-blue-200'
    },
    {
      id: 'wallet',
      name: 'E-Wallet',
      description: 'Quick checkout using Apple Pay, Google Pay, or PayPal accounts.',
      icon: Wallet,
      color: 'from-green-50 to-green-100 border-green-200'
    },
    {
      id: 'qr',
      name: 'QR Scan',
      description: 'Instant payment by scanning a dynamic QR code with your banking app.',
      icon: QrCode,
      color: 'from-purple-50 to-purple-100 border-purple-200'
    }
  ];

  const bookingData = {
    flightNumber: 'NRT - 08:45 AM',
    departure: 'LHR · 10:20 AM',
    arrival: 'NRT · 08:45 AM',
    date: 'Thursday, 12 Sep 2024',
    passengers: 1,
    passengerPrice: 2450.00,
    taxes: 312.40,
    insurance: 'Included',
    totalAmount: 2762.40
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-8 pb-32 bg-surface">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
          Secure your <span className="italic text-red">horizon.</span>
        </h1>
      </div>

      {/* Stepper with progress bar */}
       {/* Stepper Divider */}
            <div className="flex items-center justify-between w-full relative py-6 my-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[81%] h-0.5 bg-red"></div>

              <div className="w-6 h-6 rounded-full bg-red text-white flex items-center justify-center relative z-10"><Check className="w-3 h-3" /></div>
              <div className="w-6 h-6 rounded-full bg-red text-white flex items-center justify-center relative z-10"><Check className="w-3 h-3" /></div>
              <div className="w-6 h-6 rounded-full bg-red text-white flex items-center justify-center relative z-10"><Check className="w-3 h-3" /></div>
              <div className="w-6 h-6 rounded-full bg-white border-2 border-red text-red text-[10px] font-bold flex items-center justify-center relative z-10 bg-white">04</div>

              <span className="relative z-10 bg-surface pl-4 text-[10px] font-bold uppercase tracking-widest text-dark">Step 4: Payment</span>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Payment Methods */}
        <div className="lg:col-span-2">
          
          {/* Payment Methods Selection */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Choose Payment Method</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      selectedMethod === method.id 
                        ? `border-red bg-gradient-to-br ${method.color}` 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    <Icon className={`w-8 h-8 mb-3 ${selectedMethod === method.id ? 'text-red' : 'text-gray-400'}`} />
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{method.name}</h3>
                    <p className="text-xs text-gray-600">{method.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Details Form */}
          {selectedMethod === 'card' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red" />
                Card Details
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={cardDetails.cardholderName}
                    onChange={handleCardChange}
                    placeholder="e.g. ALEXANDER HAMILTON"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-red focus:ring-1 focus:ring-red text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-red focus:ring-1 focus:ring-red text-sm font-mono"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-6 h-4 bg-red rounded opacity-75"></div>
                      <div className="w-6 h-4 bg-gray-300 rounded opacity-50"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleCardChange}
                      placeholder="MM / YY"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-red focus:ring-1 focus:ring-red text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                      CVV/CVC
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="---"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-red focus:ring-1 focus:ring-red text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                <ShieldCheck className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Your payment information is encrypted and processed by our secure partner. Editorial Aviation does not store your full card details.
                </p>
              </div>
            </div>
          )}

          {/* Security Badges */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-red" />
              <span className="text-xs font-bold text-gray-700">PCI DSS SECURE</span>
            </div>
            <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red" />
              <span className="text-xs font-bold text-gray-700">NORTON SECURED</span>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 sticky top-8">
            
            {/* Flight Image */}
            <div className="relative h-40 bg-gradient-to-br from-orange-400 to-orange-600 flex items-end justify-start overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* Decorative mountain shape */}
              </div>
              <div className="absolute top-3 right-3 bg-red text-white px-3 py-1 rounded-full text-xs font-bold">
                BUSINESS CLASS
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-bold">Tokyo (NRT)</p>
                <p className="text-xs opacity-90">Narita International</p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                <div className="text-center flex-1">
                  <p className="text-xl font-bold text-gray-900">10:20 AM</p>
                  <p className="text-xs text-gray-500 font-medium">LHR</p>
                </div>
                
                <div className="flex-1 flex justify-center px-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <p className="text-xl font-bold text-gray-900">08:45 AM</p>
                  <p className="text-xs text-gray-500 font-medium">NRT</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                  <span>📅</span> {bookingData.date}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Adult Passenger (x{bookingData.passengers})</span>
                  <span className="font-semibold text-gray-900">${bookingData.passengerPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxes & Surcharges</span>
                  <span className="font-semibold text-gray-900">${bookingData.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Travel Insurance</span>
                  <span className="font-semibold text-red">{bookingData.insurance}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-700 uppercase">Total Amount</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-red">${bookingData.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Inclusive of VAC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Make Payment Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-6">
        <div className="max-w-[1280px] mx-auto">
          <button
            onClick={handleMakePayment}
            className="w-full bg-red hover:bg-red-700 text-white font-bold text-lg py-4 rounded-full transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            Make Payment
          </button>
        </div>
      </div>
    </div>
  );
};
