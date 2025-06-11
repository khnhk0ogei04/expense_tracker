import CARD_2 from "../../assets/images/card2.png";
import { LuTrendingUpDown } from "react-icons/lu";

const StatsInfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex gap-6 bg-white p-4 rounded-xl shadow-md shadow-purple-400/10 border border-gray-200/50 z-10">
      <div
        className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-xs text-gray-500 mb-1">{label}</h6>
        <span className="text-[20px]">${value}</span>
      </div>
    </div>
  );
};
const AuthLayout = ({children}) => {
    return (
        <div className="flex flex-row bg-gray-100">
            <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
                <h2 className="text-lg text-black font-semibold">Expense Tracker</h2>
                {children}
            </div>
            <div className="hidden md:block w-[40vw] h-screen bg-violet-50 bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative">
                <div className="w-48 h-48 rounded-[60px] opacity-80 bg-purple-600 absolute -bottom-7 -left-10"></div>
                <div className="w-48 h-48 rounded-[60px] opacity-70 bg-blue-400 absolute -bottom-7 -right-10"></div>
                
                <div className="grid grid-cols-1 z-20">
                    <StatsInfoCard icon={<LuTrendingUpDown />} label = "Track your income and expenses here..." value = "430000" color="bg-primary" />
                    <img src={CARD_2} className="w-64 lg:w-[90%] absolute bottom-60 shadow-lg shadow-blue-400/15" />
                </div>
            </div>
        </div>
    )
}

export default AuthLayout;