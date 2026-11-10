import mascotHello from "@assets/images/mascot-hello.svg";

export function WelcomeScreen() {
  return (
    <div className="m-auto flex w-full max-w-[550px] flex-col items-center justify-center gap-5 px-5 py-8 text-center">
      <div className="mb-1 flex size-[200px] items-center justify-center max-[769px]:size-40">
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
