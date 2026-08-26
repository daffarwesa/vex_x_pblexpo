export const metadata = {
  title: "Terms & Conditions | V-EX+",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing and using V-EX+ (Virtual Exhibition Plus), you are deemed to have read, understood, and agreed to all terms and conditions that apply to this platform.",
  },
  {
    title: "2. User Accounts",
    body: "You are fully responsible for keeping your password confidential and for all activities that occur under your account. Please report any unauthorized use of your account to our team immediately.",
  },
  {
    title: "3. Content and Projects",
    body: "Uploaded projects must be the original work of the person registered in PBL Expo. Admins and Creators are responsible for the accuracy of the project data published.",
  },
  {
    title: "4. User Interaction",
    body: "Comments and other forms of interaction must be conveyed using respectful language. We reserve the right to remove content that contains hate speech, spam, or other violations.",
  },
  {
    title: "5. Intellectual Property Rights",
    body: "Copyright of each project remains with the student creator. V-EX+ only serves as a publication platform and applies automatic watermarking as an additional form of protection.",
  },
  {
    title: "6. Changes to Terms",
    body: "We may update these terms and conditions from time to time. Any changes will be communicated through the platform before they take effect.",
  },
];

export default function SyaratKetentuanPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-main-blue">
        <p className="font-poppins font-thin text-3xl sm:text-4xl leading-none">TERMS &</p>
        <p className="font-tilt-wrap font-bold text-3xl sm:text-4xl leading-none">CONDITIONS</p>
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