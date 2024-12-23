import React from "react";

export const Button = (props: React.PropsWithChildren) => {
  return (
    <button className="relative py-2 px-6 text-white text-mde font-medium rounded-full bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition-all duration-300 ease-in-out overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#190d2e] via-[#4a208a] to-[#8c45ff] bg-[length:400%_400%] animate-gradientMove">
        <div className="rounded-full border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
        <div className="rounded-full border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>
        <div className="absolute inset-0 shadow-[0_0_15px_rgb(140,69,255,0.8)_inset] rounded-full animate-glow"></div>
      </div>
      <span className="relative z-10">{props.children}</span>
    </button>
  );
};
