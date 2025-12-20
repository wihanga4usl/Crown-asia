import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        address: form.address,
        role: "IC",
        kycStatus: "NOT_SUBMITTED",
        createdAt: serverTimestamp(),
      });

      navigate("/ic/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Create Account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Register as an Independent Consultant
        </p>

        <form onSubmit={submit} className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                name="firstName"
                required
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                name="lastName"
                required
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              name="email"
              type="email"
              required
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone</label>
            <input
              name="phone"
              required
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="label">Date of Birth</label>
            <input
              name="dob"
              type="date"
              required
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">Address</label>
            <input
              name="address"
              required
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              onChange={handleChange}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum 6 characters
            </p>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
