import { FaFilePdf, FaArrowRight } from "react-icons/fa";

export const metadata = {
  title: "V-EX+ | Tutorial",
};

const steps = [
  {
    title: "Create or log into your account",
    desc: "Register using an active email address, or log in directly if you already have an existing account.",
  },
  {
    title: "Browse the exhibition list",
    desc: "Open the \"Exhibition\" menu to view all available 3D exhibitions, or search by year and title.",
  },
  {
    title: "Enter a 3D exhibition space",
    desc: "Select an exhibition to enter the virtual space. Use your mouse or touch screen to walk around and look at your surroundings.",
  },
  {
    title: "View project details",
    desc: "Click on a booth or project poster to open its full details: description, demo video, and related links.",
  },
  {
    title: "Like and comment",
    desc: "Show your appreciation by hitting the like button, or leave a comment to give direct feedback to the project owner.",
  },
];

const tutorialPdfLink = "/tutorial/V-EX Tutorial.pdf";

export default function PetunjukPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-main-blue">
        <p className="font-poppins font-thin text-3xl sm:text-4xl leading-none">HOW TO USE</p>
        <p className="font-tilt-wrap font-bold text-3xl sm:text-4xl leading-none">V-EX+</p>
      </div>

      <p className="font-poppins font-light text-gray-600 max-w-2xl">
        Follow the steps below to start exploring PBL project exhibitions virtually.
      </p>

      <ol className="flex flex-col gap-6">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4 sm:gap-5">
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-main-blue text-white flex items-center justify-center font-poppins font-bold text-sm sm:text-base">
              {i + 1}
            </div>
            <div>
              <p className="font-poppins font-medium text-main-blue text-base sm:text-lg">{step.title}</p>
              <p className="font-poppins font-light text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}