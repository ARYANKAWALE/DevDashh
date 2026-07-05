import { ArrowRight, Sparkles } from "lucide-react";
import React from "react";

function Dashboard() {
  return (
    <div>
      <div className="flex flex-row justify-between my-5 mx-20">
        <div>
          <h1 className="text-4xl font-semibold">Developer Overview</h1>
          {/* <p><span></span></p> */}
        </div>
        <div className="flex flex-row gap-5">
          <button className="bg-gray-600 rounded-lg px-2 py-1 font-medium text-white">
            Export Report
          </button>
          <button className="bg-green-600 rounded-lg px-2 py-1 font-medium text-white">
            New Project
          </button>
        </div>
      </div>
      <div className="flex flex-row my-5 mx-20">
        <div className="w-1/3 h-fit">
          <div className='flex flex-col bg-gray-300 gap-2 w-fit h-fit p-4 rounded-xl'>
            <div className="flex flex-row justify-between gap-10">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-medium bg-[#201F1D] text-[#BBA47D] border border-[#BBA47D] rounded-xl px-2 py-1 w-fit">
                  Algorithm of the day
                </p>
                <h2 className="text-[40px] font-semibold">Two Sum</h2>
                <p className="text-[20px] font-medium text-gray-400">Easy</p>
                <p className="text-[20px] font-medium text-gray-400">150 XP</p>
              </div>
              <div>
                <Sparkles
                  className="bg-[#101717] border border-white/20 rounded-xl h-15 w-15 p-3 text-green-200"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg w-fit py-2 px-6 flex flex-row items-center justify-center m-auto">
                <button>Solve Challange</button>
                <ArrowRight size={20} className="text-black"/>
            </div>
          </div>
        </div>
        <div className="w-2/3 bg-white h-fit"></div>
      </div>
    </div>
  );
}

export default Dashboard;
