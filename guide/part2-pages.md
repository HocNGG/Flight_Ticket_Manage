# 🛫 FE Integration Guide — Part 2: Tích Hợp Vào Pages

---

## 📄 TRANG 1 — `Login.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `form { email, password }` | `useState` | Chỉ dùng trong form này |
| `rememberMe` | `useState` | UI toggle local |
| `accessToken, user` | **Zustand** | Cần ở Navbar, ProtectedRoute, toàn app |
| `isLoading, error` | React Query `useMutation` | Tự động quản lý |

### Code tích hợp:

```tsx
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLogin(); // React Query mutation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loginMutation.reset(); // xóa lỗi cũ khi user gõ lại
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: form.email, password: form.password });
  };

  const errorMsg = loginMutation.error
    ? (loginMutation.error as any)?.response?.data?.message || 'Email hoặc mật khẩu không chính xác.'
    : '';

  return (
    // ... JSX giữ nguyên, chỉ đổi các chỗ sau:
    // loading  → loginMutation.isPending
    // error    → errorMsg
    // onSubmit → handleSubmit
    <form onSubmit={handleSubmit}>
      {errorMsg && <div className="text-red-600 text-xs">{errorMsg}</div>}

      <input name="email" value={form.email} onChange={handleChange} />
      <input name="password" value={form.password} onChange={handleChange} />

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};
```

---

## 📄 TRANG 2 — `Signup.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `form { fullName, email, phoneNumber, password }` | `useState` | Local form |
| `submitted` | `useState` | Điều khiển hiển thị success UI |
| `isLoading, error` | React Query | Tự quản lý |

> ⚠️ Signup **KHÔNG** lưu vào Zustand — user chưa login, cần verify email trước!

### Code tích hợp:

```tsx
import { useState } from 'react';
import { useRegister } from '../../hooks/useAuth';

export const Signup = () => {
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', password: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    registerMutation.reset();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(form, {
      onSuccess: () => setSubmitted(true),
    });
  };

  const errorMsg = registerMutation.error
    ? (registerMutation.error as any)?.response?.data?.message || 'Đăng ký thất bại.'
    : '';

  // JSX: submitted ? <SuccessUI /> : <Form />
  // loading  → registerMutation.isPending
  // error    → errorMsg
};
```

---

## 📄 TRANG 3 — `ForgotPassword.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `step: 'request' \| 'reset' \| 'success'` | `useState` | Multi-step wizard — local |
| `email` | `useState` | Giữ giữa step 1→2 để hiển thị "OTP gửi đến {email}" |
| `otp, newPassword, confirmPassword` | `useState` | Form fields local |
| `isPending, error` | React Query | Tự quản lý |

> ✅ **Không cần Zustand** — toàn bộ state chỉ dùng trong trang này.

### Code tích hợp:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequestPasswordReset, useResetPassword } from '../../hooks/useAuth';

type Step = 'request' | 'reset' | 'success';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const requestMutation = useRequestPasswordReset();
  const resetMutation = useResetPassword();

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate(email, {
      onSuccess: () => setStep('reset'),
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return; // local validation
    resetMutation.mutate({ email, otp, newPassword }, {
      onSuccess: () => setStep('success'),
    });
  };

  // loading step1 → requestMutation.isPending
  // loading step2 → resetMutation.isPending
  // error step1  → requestMutation.error?.response?.data?.message
  // error step2  → resetMutation.error?.response?.data?.message
};
```

---

## 📄 TRANG 4 — `FlightSearch.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `departure, arrival, date, pax, class` | `useState` | Local form fields |
| `airports` (dropdown data) | **React Query** | Gọi API, cache 30' |
| `airportOptions` | **useMemo** | Transform airports → select options |
| `searchParams` (sau submit) | **Zustand** | Dùng lại ở Results + Detail |

### Tối ưu: Gọi API nào?
- `GET /api/airports/general` — **1 lần khi mount**, cache 30 phút
- **Không gọi flight API ở đây** — chỉ navigate + lưu store

### Code tích hợp:

```tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAirports } from '../../../hooks/useFlights';
import { useSearchStore } from '../../../store/useSearchStore';

export const FlightSearch = () => {
  const navigate = useNavigate();
  const { setSearchParams } = useSearchStore();

  // Local form state
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [seatClass, setSeatClass] = useState<'ECONOMY' | 'BUSINESS' | 'FIRST'>('ECONOMY');

  // React Query: airports gọi 1 lần, cache dài
  const { data: airports = [], isLoading: loadingAirports } = useAirports();

  // useMemo: transform airport list → dropdown options
  // Chỉ recompute khi airports thay đổi
  const airportOptions = useMemo(
    () => airports.map((a) => ({
      value: a.airportCode,
      label: `${a.airportCode} — ${a.airportName}`,
    })),
    [airports]
  );

  const canSearch = departure && arrival && departure !== arrival && departureDate;

  const handleSearch = () => {
    const params = { departure, arrival, departureDate, passengerCount, seatClass };

    // Lưu Zustand để FlightResults + FlightDetail dùng lại
    setSearchParams(params);

    // Navigate với URL params (user có thể F5, copy link)
    const query = new URLSearchParams({
      departure, arrival, departureDate,
      passengerCount: String(passengerCount),
      seatClass,
    });
    navigate(`/results?${query.toString()}`);
  };

  // Truyền airportOptions vào DropdownInputOff / DropdownInputLanding
  // loadingAirports → disabled dropdown + hiện skeleton
};
```

---

## 📄 TRANG 5 — `FlightResults.tsx` ⭐ Trang phức tạp nhất

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `searchParams` | **Zustand** (read) | Lấy từ store để gọi API |
| `flights` | **React Query** | Cache theo params, loading/error tự động |
| `sortBy` | `useState` | Sắp xếp — local UI |
| `selectedAirlines` | `useState` | Filter — local UI |
| `queryParams` | **useMemo** | Build từ URL params hoặc Zustand fallback |
| `airlineOptions` | **useMemo** | Extract unique airlines từ flight list |
| `filteredFlights` | **useMemo** | Apply filter + sort — không gọi thêm API |

### Tối ưu: Gọi API nào?
- `GET /api/flights?...` — **1 lần** khi có đủ params
- `queryKey: ['flights', params]` → nếu params giống → **dùng cache**, không gọi lại
- Filter/sort hoàn toàn **client-side** bằng `useMemo`

### Code tích hợp:

```tsx
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearchFlights } from '../../../hooks/useFlights';
import { useSearchStore } from '../../../store/useSearchStore';

export const FlightResults = () => {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const { searchParams: storedParams } = useSearchStore();

  // Local UI state
  const [sortBy, setSortBy] = useState<'price' | 'departure'>('price');
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  // useMemo: build query params — ưu tiên URL, fallback Zustand
  const queryParams = useMemo(() => {
    const dep = urlParams.get('departure');
    const arr = urlParams.get('arrival');
    const date = urlParams.get('departureDate');
    if (dep && arr && date) {
      return {
        departure: dep,
        arrival: arr,
        departureDate: date,
        passengerCount: Number(urlParams.get('passengerCount')) || 1,
        seatClass: (urlParams.get('seatClass') || 'ECONOMY') as 'ECONOMY' | 'BUSINESS' | 'FIRST',
      };
    }
    return storedParams; // fallback
  }, [urlParams, storedParams]);

  // React Query: gọi API, cache theo queryParams
  const { data: flights = [], isLoading, isError } = useSearchFlights(queryParams);

  // useMemo: extract danh sách hãng bay duy nhất từ kết quả
  const airlineOptions = useMemo(
    () => [...new Map(flights.map((f) => [f.airline.airlineId, f.airline])).values()],
    [flights]
  );

  // useMemo: filter + sort client-side — không gọi thêm API
  const filteredFlights = useMemo(() => {
    let result = [...flights];

    if (selectedAirlines.length > 0) {
      result = result.filter((f) =>
        selectedAirlines.includes(String(f.airline.airlineId))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'price') return a.basePrice - b.basePrice;
      if (sortBy === 'departure')
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      return 0;
    });

    return result;
  }, [flights, selectedAirlines, sortBy]);

  const toggleAirline = (id: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Không thể tải chuyến bay. Vui lòng thử lại.</div>;

  // JSX:
  // - Sidebar: airlineOptions.map → dynamic checkbox filter (thay hardcode)
  // - Header: "Tìm thấy {filteredFlights.length} chuyến bay"
  // - List: filteredFlights.map(<FlightResultCard />) — xóa mockFlights
  // - Sort buttons: onClick={() => setSortBy('price' | 'departure')}
};
```

---

## 📌 Sơ Đồ Luồng Data Tổng Quan

```
[FlightSearch]
  useState: departure, arrival, date, pax, class  ← local form
  useAirports() → React Query (airports, cache 30')
        ↓ submit
  useSearchStore.setSearchParams()  ← Zustand write
  navigate('/results?...')          ← URL params

[FlightResults]
  URL params → queryParams (useMemo, priority 1)
  Zustand searchParams → queryParams (fallback, priority 2)
  useSearchFlights(queryParams) → React Query ← GỌI API
        ↓ data: flights[]
  airlineOptions = useMemo(flights)
  filteredFlights = useMemo(flights + sort + filter)  ← CLIENT SIDE
  useState: sortBy, selectedAirlines  ← local UI
        ↓ click "Chọn"
  navigate('/detail/:flightId')

[Login]
  useState: form, rememberMe  ← local
  useLogin() → useMutation
        ↓ onSuccess
  useAuthStore.setTokens()  ← Zustand write + localStorage
  navigate('/search')

[Signup]  → useMutation register → show success UI → navigate('/login')
[ForgotPassword]  → 2 useMutation (request + reset) → multi-step local
```

---

## ✅ Checklist Thực Hiện (Theo Thứ Tự)

```
[ ] npm install zustand @tanstack/react-query axios
[ ] Wrap QueryClientProvider trong main.tsx
[ ] Tạo src/api/axiosInstance.ts
[ ] Tạo src/api/types.ts
[ ] Tạo src/api/authApi.ts
[ ] Tạo src/api/flightApi.ts
[ ] Tạo src/store/useAuthStore.ts
[ ] Tạo src/store/useSearchStore.ts
[ ] Tạo src/hooks/useAuth.ts
[ ] Tạo src/hooks/useFlights.ts
[ ] Tích hợp Login.tsx
[ ] Tích hợp Signup.tsx
[ ] Tích hợp ForgotPassword.tsx
[ ] Tích hợp FlightSearch.tsx + truyền airportOptions vào dropdown
[ ] Tích hợp FlightResults.tsx — xóa mockFlights, dùng React Query
```
