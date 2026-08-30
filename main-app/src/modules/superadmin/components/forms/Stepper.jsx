export default function Stepper({ tabs, activeTab }) {
  const currentStep = tabs.findIndex(([key]) => key === activeTab);

  return (
    <div className="bg-white border-b">
      <div className="px-4 py-4">
        <div className="flex items-center">
          {tabs.map(([key, label], index) => {
            const step = index + 1;
            const completed = index <= currentStep;

            return (
              <div key={key} className="flex items-center flex-1">
                {/* Step */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    style={{
                      backgroundColor: completed ? "#0C3D2E" : "#E8F0EC",
                      color: completed ? "#fff" : "#0C3D2E",
                    }}
                    className="
                      w-7 h-7
                      sm:w-8 sm:h-8
                      rounded-full
                      flex items-center justify-center
                      text-[11px]
                      sm:text-xs
                      font-semibold
                      transition-all
                    "
                  >
                    {step}
                  </div>

                  {/* Labels only on >= sm */}
                  <span
                    style={{
                      color: completed ? "#0C3D2E" : undefined,
                    }}
                    className={`
                      hidden sm:block
                      mt-2
                      text-xs
                      text-center
                      whitespace-nowrap
                      ${
                        completed
                          ? ""
                          : "text-slate-400"
                      }
                    `}
                  >
                    {label}
                  </span>
                </div>

                {/* Connector */}
                {index !== tabs.length - 1 && (
                  <div
                    className="
                      flex-1
                      h-1
                      rounded-full
                      bg-[#E8F0EC]
                      overflow-hidden
                      mx-1 sm:mx-3
                    "
                  >
                    <div
                      className={`
                        h-full
                        bg-[#0C3D2E]
                        transition-all
                        duration-300
                        ${
                          index < currentStep
                            ? "w-full"
                            : "w-0"
                        }
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Active Label */}
        <div className="sm:hidden mt-4 text-center">
          <p className="text-sm font-semibold text-[#0C3D2E]">
            Step {currentStep + 1} of {tabs.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {tabs[currentStep]?.[1]}
          </p>
        </div>
      </div>
    </div>
  );
}