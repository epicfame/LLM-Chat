import mascotHello from "@assets/images/mascot-hello.svg";

export function WelcomeScreen() {
  return (
    <div className="m-auto flex w-full max-w-[550px] flex-col items-center justify-center gap-3 px-3 py-4 sm:gap-5 sm:px-5 sm:py-8 text-center">
      <div className="mb-1 flex size-32 shrink-0 items-center justify-center sm:size-40 md:size-[200px]">
        <img src={mascotHello} alt="Chat mascot" className="size-full animate-mascot-float object-contain motion-reduce:animate-none" />
      </div>

      <div className="flex flex-col items-center gap-2.5 [&_p]:m-0 [&_p]:max-w-[420px] [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:text-text-muted">
        <p>
          Ask me anything. I'm here to help you explore ideas, solve problems,
          and learn something new.
        </p>
      </div>
    </div>
  );
}
