import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <section className="h-screen bg-gradient-to-b from-[#000000] via-[#017CEE] via-69% to-[#0054FF]">
        <header className="flex justify-start p-6">
          <Image
            src="/assets/logos/cssapply_logo.png"
            alt="A descriptive alt text for your image"
            width={110}
            height={190}
          ></Image>
        </header>

        <div className="text-2xl flex flex-col justify-center items-center">
          <h3 className="text-[#285C9F]">YOUR JOURNEY IN TECH STARTS HERE</h3>
          <h1 className="text-9xl bg-gradient-to-b from-[#003A78] to-[#003C7F] bg-clip-text text-transparent">
            READY TO JOIN CSS?
          </h1>
        </div>
      </section>
    </div>
  );
}
