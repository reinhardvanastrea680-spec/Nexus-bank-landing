import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiPost } from "../lib/api";

type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  idType: string;
  idNumber: string;
  ssnLast4: string;
  accountType: string;
  securityQuestion: string;
  securityAnswer: string;
  agreeTerms: boolean;
};

const STEPS = [
  "Personal Info",
  "Contact Details",
  "ID Verification",
  "Account Setup",
];

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  nationality: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  idType: "",
  idNumber: "",
  ssnLast4: "",
  accountType: "",
  securityQuestion: "",
  securityAnswer: "",
  agreeTerms: false,
};

type FProps = {
  label: string;
  id: keyof FormData;
  type?: string;
  placeholder?: string;
  as?: "input" | "select";
  options?: string[];
  children?: React.ReactNode;
  form: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  set: (field: keyof FormData, value: string | boolean) => void;
};

function F({
  label,
  id,
  type = "text",
  placeholder = "",
  as: as_ = "input",
  options = [],
  children,
  form,
  errors,
  set,
}: FProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {as_ === "select" ? (
        <select
          className="form-control form-select"
          value={form[id] as string}
          onChange={(e) => set(id, e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="form-control"
          type={type}
          placeholder={placeholder}
          value={form[id] as string}
          onChange={(e) => set(id, e.target.value)}
        />
      )}
      {errors[id] && <div className="form-error">⚠ {errors[id]}</div>}
      {children}
    </div>
  );
}

export default function OpenAccount() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
      if (!form.nationality.trim()) e.nationality = "Nationality is required";
    }
    if (step === 1) {
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
        e.email = "Valid email is required";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.city.trim()) e.city = "City is required";
      if (!form.state.trim()) e.state = "State is required";
    }
    if (step === 2) {
      if (!form.idType) e.idType = "ID type is required";
      if (!form.idNumber.trim()) e.idNumber = "ID number is required";
      if (!form.ssnLast4.trim() || form.ssnLast4.length !== 4)
        e.ssnLast4 = "Last 4 digits of SSN required";
    }
    if (step === 3) {
      if (!form.accountType) e.accountType = "Account type is required";
      if (!form.securityQuestion)
        e.securityQuestion = "Security question is required";
      if (!form.securityAnswer.trim())
        e.securityAnswer = "Security answer is required";
      if (!form.agreeTerms) e.agreeTerms = "You must agree to the terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate()) setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    // Skip API call for now, just redirect
    setTimeout(() => {
      navigate("/account-pending");
      setLoading(false);
    }, 500);
  };

  return (
    <section className="section-pad light-bg" style={{ minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="section-label">New Account</div>
          <h1 className="section-title">Open Your Nexsus Bank Account</h1>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Complete the steps below. Your information is encrypted and 100%
            secure.
          </p>
        </div>

        {/* Stepper */}
        <div className="stepper" style={{ marginBottom: 32 }}>
          {STEPS.map((label, i) => (
            <div
              key={i}
              className="step-item"
              style={{
                display: "flex",
                alignItems: "flex-start",
                flex: i < STEPS.length - 1 ? 1 : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  className="step-circle"
                  style={{
                    background:
                      i < step
                        ? "var(--teal)"
                        : i === step
                          ? "var(--blue)"
                          : "var(--bg-white)",
                    borderColor:
                      i < step
                        ? "var(--teal)"
                        : i === step
                          ? "var(--blue)"
                          : "var(--border)",
                    color: i <= step ? "#fff" : "var(--text-muted)",
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <div
                  className="step-label"
                  style={{
                    color:
                      i === step
                        ? "var(--blue)"
                        : i < step
                          ? "var(--teal)"
                          : "var(--text-muted)",
                  }}
                >
                  {label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: i < step ? "var(--teal)" : "var(--border)",
                    margin: "18px 4px 0",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="form-step">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <>
              <h2 className="form-step-title">Personal Information</h2>
              <p className="form-step-subtitle">
                Tell us about yourself. All information is kept strictly
                confidential.
              </p>
              <div className="form-row">
                <F
                  label="First Name *"
                  id="firstName"
                  placeholder="John"
                  form={form}
                  errors={errors}
                  set={set}
                />
                <F
                  label="Last Name *"
                  id="lastName"
                  placeholder="Doe"
                  form={form}
                  errors={errors}
                  set={set}
                />
              </div>
              <div className="form-row">
                <F
                  label="Date of Birth *"
                  id="dateOfBirth"
                  type="date"
                  form={form}
                  errors={errors}
                  set={set}
                />
                <F
                  label="Nationality *"
                  id="nationality"
                  as="select"
                  options={[
                    "Nigerian",
                    "American",
                    "British",
                    "Canadian",
                    "Australian",
                    "German",
                    "French",
                    "South African",
                    "Ghanaian",
                    "Kenyan",
                    "Egyptian",
                    "Moroccan",
                    "Tunisian",
                    "Senegalese",
                    "Ivorian",
                    "Malian",
                    "Burkinabé",
                    "Nigerien",
                    "Beninese",
                    "Togolese",
                    "Cameroonian",
                    "Chadian",
                    "Congolese (DRC)",
                    "Congolese (Republic)",
                    "Angolan",
                    "Zambian",
                    "Zimbabwean",
                    "Malawian",
                    "Mozambican",
                    "Ethiopian",
                    "Somali",
                    "Djiboutian",
                    "Eritrean",
                    "Sudanese",
                    "South Sudanese",
                    "Ugandan",
                    "Rwandan",
                    "Burundian",
                    "Tanzanian",
                    "Sierra Leonean",
                    "Liberian",
                    "Guinean",
                    "Guinea-Bissauan",
                    "Mauritanian",
                    "Malagasy",
                    "Mauritian",
                    "Seychellois",
                    "Comorian",
                    "Other",
                  ]}
                  form={form}
                  errors={errors}
                  set={set}
                />
              </div>
            </>
          )}

          {/* Step 1: Contact Details */}
          {step === 1 && (
            <>
              <h2 className="form-step-title">Contact Details</h2>
              <p className="form-step-subtitle">
                We'll use this information to contact you about your account.
              </p>
              <div className="form-row">
                <F
                  label="Email Address *"
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  form={form}
                  errors={errors}
                  set={set}
                />
                <F
                  label="Phone Number *"
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  form={form}
                  errors={errors}
                  set={set}
                />
              </div>
              <F
                label="Street Address *"
                id="address"
                placeholder="123 Main Street, Apt 4B"
                form={form}
                errors={errors}
                set={set}
              />
              <div className="form-row">
                <F
                  label="City *"
                  id="city"
                  placeholder="Charlotte"
                  form={form}
                  errors={errors}
                  set={set}
                />
                <F
                  label="State *"
                  id="state"
                  as="select"
                  options={[
                    "Alabama",
                    "Alaska",
                    "Arizona",
                    "Arkansas",
                    "California",
                    "Colorado",
                    "Connecticut",
                    "Delaware",
                    "Florida",
                    "Georgia",
                    "Hawaii",
                    "Idaho",
                    "Illinois",
                    "Indiana",
                    "Iowa",
                    "Kansas",
                    "Kentucky",
                    "Louisiana",
                    "Maine",
                    "Maryland",
                    "Massachusetts",
                    "Michigan",
                    "Minnesota",
                    "Mississippi",
                    "Missouri",
                    "Montana",
                    "Nebraska",
                    "Nevada",
                    "New Hampshire",
                    "New Jersey",
                    "New Mexico",
                    "New York",
                    "North Carolina",
                    "North Dakota",
                    "Ohio",
                    "Oklahoma",
                    "Oregon",
                    "Pennsylvania",
                    "Rhode Island",
                    "South Carolina",
                    "South Dakota",
                    "Tennessee",
                    "Texas",
                    "Utah",
                    "Vermont",
                    "Virginia",
                    "Washington",
                    "West Virginia",
                    "Wisconsin",
                    "Wyoming",
                  ]}
                  form={form}
                  errors={errors}
                  set={set}
                />
              </div>
              <F
                label="ZIP Code"
                id="zipCode"
                placeholder="28202"
                form={form}
                errors={errors}
                set={set}
              />
            </>
          )}

          {/* Step 2: ID Verification */}
          {step === 2 && (
            <>
              <h2 className="form-step-title">Identity Verification</h2>
              <p className="form-step-subtitle">
                We're required by federal law to verify your identity. Your data
                is fully encrypted.
              </p>
              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                🔒 Your identity information is encrypted with 256-bit SSL and
                never shared with third parties.
              </div>
              <F
                label="Government ID Type *"
                id="idType"
                as="select"
                options={[
                  "Passport",
                  "Driver's License",
                  "State ID",
                  "Military ID",
                  "Permanent Resident Card",
                ]}
                form={form}
                errors={errors}
                set={set}
              />
              <div className="form-row">
                <F
                  label="ID Number *"
                  id="idNumber"
                  placeholder="e.g. A12345678"
                  form={form}
                  errors={errors}
                  set={set}
                />
                <F
                  label="Last 4 Digits of SSN *"
                  id="ssnLast4"
                  placeholder="XXXX"
                  type="password"
                  form={form}
                  errors={errors}
                  set={set}
                >
                  <div className="form-help">
                    For verification purposes only. We use bank-grade
                    encryption.
                  </div>
                  {errors.ssnLast4 && (
                    <div className="form-error">⚠ {errors.ssnLast4}</div>
                  )}
                </F>
              </div>
            </>
          )}

          {/* Step 3: Account Setup */}
          {step === 3 && (
            <>
              <h2 className="form-step-title">Account Setup</h2>
              <p className="form-step-subtitle">
                Almost done! Choose your account type and set up your security
                preferences.
              </p>
              <F
                label="Account Type *"
                id="accountType"
                as="select"
                options={[
                  "Personal Checking",
                  "Personal Savings",
                  "Joint Checking",
                  "Joint Savings",
                  "Business Checking",
                  "Business Savings",
                ]}
                form={form}
                errors={errors}
                set={set}
              />
              <div className="form-row">
                <F
                  label="Security Question *"
                  id="securityQuestion"
                  as="select"
                  options={[
                    "What was the name of your first pet?",
                    "What is your mother's maiden name?",
                    "What city were you born in?",
                    "What was the name of your primary school?",
                    "What was the make of your first car?",
                  ]}
                  form={form}
                  errors={errors}
                  set={set}
                />
                <F
                  label="Security Answer *"
                  id="securityAnswer"
                  placeholder="Your answer"
                  form={form}
                  errors={errors}
                  set={set}
                />
              </div>
              <div className="form-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => set("agreeTerms", e.target.checked)}
                    style={{
                      marginTop: 3,
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-body)",
                      lineHeight: 1.5,
                    }}
                  >
                    I agree to the{" "}
                    <Link href="#" style={{ color: "var(--blue)" }}>
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="#" style={{ color: "var(--blue)" }}>
                      Privacy Policy
                    </Link>
                    . I confirm that all information provided is accurate and
                    complete.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <div className="form-error">⚠ {errors.agreeTerms}</div>
                )}
              </div>
            </>
          )}

          <div className="form-actions">
            {step > 0 ? (
              <button className="btn btn-outline" onClick={back}>
                ← Back
              </button>
            ) : (
              <Link href="/" className="btn btn-outline">
                Cancel
              </Link>
            )}
            {step < 3 ? (
              <button className="btn btn-primary" onClick={next}>
                Continue →
              </button>
            ) : (
              <button
                className="btn btn-gold"
                onClick={() => void submit()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" /> Submitting...
                  </>
                ) : (
                  "Submit Application →"
                )}
              </button>
            )}
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 20,
          }}
        >
          🔒 256-bit SSL Encrypted · FDIC Member · Your data is never sold or
          shared
        </p>
      </div>
    </section>
  );
}
