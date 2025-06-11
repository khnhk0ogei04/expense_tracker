import { useState } from "react"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({label, value, onChange, placeholder, type}) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    return (
        <>
            <div>
                <label className="text-[14px] font-medium text-slate-800">{label}</label>
                <div className="input-box mt-2">
                    <input
                        type={type == 'password' ? showPassword ? 'text' : 'password' : type}
                        placeholder={placeholder}
                        className="w-full bg-transparent outline-none"
                        value={value}
                        onChange={(e) => onChange(e)}
                    />
                    {type === 'password' && (
                        <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            onClick={toggleShowPassword}
                        >
                            {showPassword ? (
                                <FaRegEye
                                    size={22}
                                    className="text-primary cursor-pointer"
                                    onClick={() => toggleShowPassword()}
                                />
                                ) : (
                                <FaRegEyeSlash
                                    size={22}
                                    className="text-slate-400 cursor-pointer"
                                    onClick={() => toggleShowPassword()}
                                />
                                )}
                        </span>
                    )}
                </div>
            </div>
        </>
    )
}

export default Input;