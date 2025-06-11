import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import Input from '../../components/Inputs/Input';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import { validateEmail } from '../../utils/helper';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';

const SignUp = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();
    const handleSignUp = async (e) => {
        e.preventDefault();
        let profileImageUrl = "";
        if (!fullName) {
            setError("Please enter your name...");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        setError("");
        try {
            // Upload image if present
            if (profilePic) {
                const imgUploadRes = await uploadImage(profilePic);
                profileImageUrl = imgUploadRes.imageUrl || "";
            }

            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
                fullName,
                email,
                password,
                profileImageUrl,
            });

            const { token, user } = response.data;

            if (token) {
                localStorage.setItem("token", token);
                updateUser(user);
                navigate("/dashboard");
            }
        } catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };
    return (
        <>
            <AuthLayout>   
                <div className='w-[70%] lg:w-[100%] h-auto md:h-full flex flex-col justify-center'>
                    <h3 className='text-2xl font-semibold text-black'>Create New Account</h3>
                    <p className='text-md text-slate-700 mt-2 mb-4'>
                        Enter all the details to create a new account.
                    </p>
                    <form onSubmit={handleSignUp}>
                        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <Input
                                value={fullName}
                                onChange = {(e) => setFullName(e.target.value)}
                                label="FullName"
                                placeholder="Fullname..."
                                type="text"
                            />
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email Address"
                                placeholder="Email..."
                                type={"text"}
                            />
                            <div className="col-span-2">
                                <Input
                                    value={password}
                                    onChange={({ target }) => setPassword(target.value)}
                                    label="Password"
                                    placeholder="Min 8 Characters"
                                    type="password"
                                />
                            </div>
                        </div>
                        {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
                        <button type='submit' className='btn-primary mt-4 cursor-pointer'>
                            SIGN UP
                        </button>
                        <p className="text-[13px] font-semibold text-slate-800 mt-3">
                            Already have an account?{" "}
                            <Link className="mx-3 font-semibold text-primary underline" to="/login">
                                Login
                            </Link>
                        </p>
                    </form>
                </div>
            </AuthLayout>
        </>
    )
}

export default SignUp