export const metadata = {
  title: "Privacy Policy | V-EX+",
};

const sections = [
  {
    title: "1. Data We Collect",
    body: "We collect basic data such as name, email, and study program when you register an account, as well as project data uploaded by PBL Coordinators for exhibition purposes.",
  },
  {
    title: "2. Use of Data",
    body: "Data is used for authentication, personalizing your exhibition experience, and communicating with you about activity on your V-EX+ account. We do not share your personal data with third parties without your consent.",
  },
  {
    title: "3. Project Protection",
    body: "Every published project is automatically watermarked as a form of protection against misuse or ownership claims by unauthorized parties.",
  },
  {
    title: "4. Data Security",
    body: "We apply standard security practices such as password encryption to keep your account data confidential and protected from unauthorized access.",
  },
  {
    title: "5. User Rights",
    body: "You have the right to access, update, or delete your account data at any time through the account settings menu, or by contacting our team.",
  },
  {
    title: "6. Changes to This Policy",
    body: "This privacy policy may be updated from time to time as our services evolve. Significant changes will be communicated through the platform.",
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-main-blue">
        <p className="font-poppins font-thin text-3xl sm:text-4xl leading-none">PRIVACY</p>
        <p className="font-tilt-wrap font-bold text-3xl sm:text-4xl leading-none">POLICY</p>
      </div>

      <p className="font-poppins font-light text-gray-500 text-sm">Last updated: July 12, 2026</p>

      <div className="flex flex-col gap-6">
        {sections.map((s, i) => (
          <div key={i}>
            <p className="font-poppins font-medium text-main-blue text-base sm:text-lg mb-2">{s.title}</p>
            <p className="font-poppins font-light text-gray-600 text-sm sm:text-base leading-relaxed text-justify">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}