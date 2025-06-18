interface ButtonTabProps {
  refs: any;
  name: string;
}
import Image from "next/image";
export default function ButtonTab({ refs, name }: ButtonTabProps) {
  return (
    <button
      type="button"
      className="button-tab px-2 py-1 pl-6  relative cursor-pointer"
      data-name={name}
      ref={(el) => {
        if (el && !refs.current.includes(el)) {
          refs.current.push(el);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target.closest("button").classList.contains("button-tab")) {
          refs.current.forEach((btn: any) => {
            if (btn?.dataset.name === name) {
              if (btn.classList.contains("run")) {
                btn.classList.remove("run");
                const hiddenElements = [
                  ...btn?.nextElementSibling.querySelectorAll(".button-tab"),
                ];

                if (hiddenElements.length > 0) {
                  hiddenElements.forEach((element) => {
                    element.classList.remove("run");
                  });
                }
              } else {
                btn.classList.add("run");
              }
            }
          });
        }
      }}
    >
      <Image
        src="./assets/svg/click.svg"
        alt="click"
        width={15}
        height={15}
        className=" absolute top-1/2 left-2 -translate-y-1/2"
      />
      {name}
    </button>
  );
}
