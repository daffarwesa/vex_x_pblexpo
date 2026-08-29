export const metadata = {
  title: "V-EX+ | FAQs",
};

const faqs = [
  {
    q: "What is V-EX+ (Virtual Exhibition Plus)?",
    a: "V-EX+ is a 3D-based exhibition platform for PBL (Project Based Learning) projects, born from a collaboration between V-EX and PBL Expo at Politeknik Negeri Batam. It allows students to showcase their projects virtually and interactively to the public.",
  },
  {
    q: "Who can access V-EX+?",
    a: "Anyone can visit and explore the exhibition publicly. To leave comments and like projects, visitors need to create an account first.",
  },
  {
    q: "How do I register an account?",
    a: "Click the \"Register\" button on the homepage, then fill in your details using an active email address. Once verified, your account is ready to use for interacting with the exhibition.",
  },
  {
    q: "How many project categories are there in the exhibition?",
    a: "There are 12 project categories in total. Each category has its own winner, resulting in 12 winning projects across the exhibition.",
  },
  {
    q: "How is a category winner chosen?",
    a: "Each of the 12 category winners is judged directly by a panel of judges based on quality, creativity, and innovation. One winning project is selected per category, for 12 winners overall.",
  },
  {
    q: "What is \"Best Project\", and is it different from the 12 category winners?",
    a: "Yes, it's separate. Aside from the 12 category winners, there are also 3 additional overall categories used to determine Best Project — these 3 categories are distinct from the 12 project categories mentioned earlier.",
  },
  {
    q: "What's the difference between \"Best Project\" and \"Favorite Project\"?",
    a: "Best Project is chosen by the judges based on quality assessment across the 3 overall categories. Favorite Project is determined by the highest number of likes from all visitors, regardless of category.",
  },
  {
    q: "Are the displayed projects copyright protected?",
    a: "Yes. Every uploaded project is automatically watermarked as a form of protection for the students' work. More details can be found on the Privacy Policy page.",
  },
  {
    q: "I forgot my account password, what should I do?",
    a: "Use the \"Forgot Password\" feature on the login page. The system will send a password reset link to your registered email.",
  },
];

export default function FaqsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-main-blue">
        <p className="font-poppins font-thin text-3xl sm:text-4xl leading-none">FREQUENTLY ASKED</p>
        <p className="font-tilt-wrap font-bold text-3xl sm:text-4xl leading-none">QUESTIONS (FAQs)</p>
      </div>

      <p className="font-poppins font-light text-gray-600 max-w-2xl">
        Couldn't find the answer you're looking for? Contact us through the{" "}
        <a href="/contact-us" className="text-main-blue font-medium underline underline-offset-2">
          Contact Us
        </a>{" "}
        page.
      </p>

      <div className="flex flex-col gap-3">
        {faqs.map((item, i) => (
          <details
            key={i}
            className="group border border-gray-200 rounded-xl px-5 py-4 open:bg-secondary-color/50 transition-colors"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-poppins font-medium text-main-blue">
              {item.q}
              <span className="shrink-0 text-xl leading-none transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 font-poppins font-light text-gray-600 text-sm sm:text-base leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}