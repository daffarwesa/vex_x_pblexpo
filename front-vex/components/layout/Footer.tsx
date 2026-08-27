import { FaInstagram, FaYoutube } from "react-icons/fa";

import {
  LogoWhite,
  LinkAkses,
  LinkAksesEks,
} from "@/components/shared/ui/Components";

import { VectorBox } from "@/components/shared/ui/BoxModel";
import "@/app/globals.css";

export default function Footer() {
  return (
    <footer className="w-full bg-main-blue text-white overflow-hidden">
      <div className="relative flex flex-col lg:flex-row items-stretch">
        {/* LEFT - Logo (bottom on phone, left on desktop) */}
        <div className="w-full lg:w-[45%] relative px-5 sm:px-8 lg:px-10 pt-10 pb-8 flex flex-col overflow-hidden min-h-[220px] lg:min-h-[320px] order-2 lg:order-1">
          <div className="relative z-20">
            <LogoWhite />
          </div>

          <div className="mt-10 lg:mt-auto relative z-20">
            <p className="text-xs sm:text-sm md:text-base text-white font-poppins font-normal tracking-wide leading-relaxed">
              © V-EX+ x PBL EXPO
            </p>
          </div>

          <div className="absolute -bottom-24 -left-20 sm:-bottom-28 sm:-left-16 lg:bottom-[-140px] lg:left-[-120px] opacity-20 pointer-events-none z-0">
            <VectorBox className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[420px] lg:h-[420px]" />
          </div>
        </div>

        {/* RIGHT - Links (top on phone, right on desktop) */}
        <div className="w-full lg:w-[55%] border-t border-white/10 lg:border-t-0 lg:border-l lg:border-white/10 px-5 sm:px-8 lg:px-16 py-8 sm:py-10 flex flex-col min-h-[260px] order-1 lg:order-2">
          <div className="footer-links grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="font-extrabold text-white mb-3 text-lg sm:text-xl tracking-wider">
                About
              </h3>
              <ul className="text-white/70 space-y-2 text-sm sm:text-base">
                <li>
                  <LinkAkses link={"/pameran"} title={"Exhibition"} />
                </li>
                {/* <li>
                  <LinkAkses link={"/#karya"} title={"Projects"} />
                </li>
                <li>
                  <LinkAkses link={"/#akun"} title={"Account"} />
                </li> */}
              </ul>
            </div>

            <div>
              <h3 className="font-extrabold text-white mb-3 text-lg sm:text-xl tracking-wider">
                Source
              </h3>
              <ul className="text-white/70 space-y-2 text-sm sm:text-base">
                <li>
                  <LinkAkses link={"/faqs"} title={"FAQs"} />
                </li>
                <li>
                  <LinkAkses link={"/tutorial"} title={"Tutorial"} />
                </li>
                <li>
                  <LinkAkses link={"/service"} title={"Service"} />
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-extrabold text-white mb-3 text-lg sm:text-xl tracking-wider">
                Terms
              </h3>
              <ul className="text-white/70 space-y-2 text-sm sm:text-base">
                <li>
                  <LinkAksesEks
                    link={"/terms-conditions"}
                    title="Terms & Conditions"
                  />
                </li>
                <li>
                  <LinkAksesEks
                    link={"/privacy-policy"}
                    title="Privacy Policy"
                  />
                </li>
                <li>
                  <LinkAksesEks link={"/contact-us"} title="Contact Us" />
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-7 pr-3 lg:mt-auto flex flex-wrap justify-center sm:justify-start lg:justify-end items-center gap-4 sm:gap-5 text-white">
            <LinkAksesEks link="https://www.instagram.com/virtualexhibition204/">
              <FaInstagram className="w-8 h-8 sm:w-10 sm:h-10 hover:scale-125 transition-all cursor-pointer" />
            </LinkAksesEks>
            <LinkAksesEks
              link={"https://youtube.com/@pbl-trpl204?si=kWdrqlvURisWyhHv"}
            >
              <FaYoutube className="w-8 h-8 sm:w-10 sm:h-10 hover:scale-125 transition-all cursor-pointer" />
            </LinkAksesEks>
          </div>
        </div>
      </div>
    </footer>
  );
}
