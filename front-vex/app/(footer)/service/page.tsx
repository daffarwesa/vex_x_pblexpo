export const metadata = {
  title: "Service | V-EX+",
};

const layanan = [
  {
    title: "3D Virtual Exhibition",
    desc: "An interactive 3D exhibition space for showcasing projects in an immersive way, accessible anytime without location limits.",
  },
  {
    title: "Project Management",
    desc: "Creators and Admins can upload, update, and manage projects and exhibition booths through an easy-to-use dashboard.",
  },
  {
    title: "Winner Judging",
    desc: "Judges can review and select category winners directly through the system, based on quality, creativity, and innovation.",
  },
  {
    title: "Visitor Interaction",
    desc: "Visitors can leave comments and likes on projects, opening up a space for direct appreciation and feedback from the public.",
  },
  {
    title: "Technical Support",
    desc: "Our team is ready to help if you run into technical issues while using the platform. Reach out to us through the Contact Us page.",
  },
];

export default function PelayananPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-main-blue">
        <p className="font-poppins font-thin text-3xl sm:text-4xl leading-none">OUR</p>
        <p className="font-tilt-wrap font-bold text-3xl sm:text-4xl leading-none">SERVICES</p>
      </div>

      <p className="font-poppins font-light text-gray-600 max-w-2xl">
        Here are the services available on V-EX+ to support the publication of projects by people
        registered in PBL Expo at Polibatam.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {layanan.map((item, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl px-5 py-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
          >
            <p className="font-poppins font-medium text-main-blue text-base sm:text-lg">{item.title}</p>
            <p className="font-poppins font-light text-gray-600 text-sm sm:text-base leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}