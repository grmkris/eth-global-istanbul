import { Header } from "@/components/layout/Header.tsx";

export const Landing = () => {
  return (
    <div className="bg-background-dark h-screen">
      <Header />
      <div className="mx-auto mt-20 flex justify-center gap-5">
        <img
          height={500}
          width={500}
          className="rounded-xl"
          src="/images/landing.png"
          alt=""
        />
        <div className="text-success-400 min-w-[700px] p-4 text-xl">
          Description
        </div>
      </div>
    </div>
  );
};
