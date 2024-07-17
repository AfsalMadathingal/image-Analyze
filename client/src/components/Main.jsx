import React, { useRef, useEffect, useState } from "react";
import imageScan from "../assets/image.png";
import ReactLoading from "react-loading";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Main = () => {
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [image, setImage] = useState(null);


  const handleScan = async () => {
    try {
      setLoading(true);
      const imageArea = document.querySelector(".image-area");

      html2canvas(imageArea).then((canvas) => {
  
        canvas.toBlob(async (blob) => {
  
          const formData = new FormData();
          formData.append("image", blob, "screenshot.png");
          formData.append("limit", localStorage.getItem("limit"));

          
          const server =  import.meta.env.VITE_SERVER
       const result =  await  fetch(`${server}/scan`, {
            method: "POST",
            body: formData,
          })

          const data = await result.json();
          console.log(data);
          if(data.success==false){
            console.log('====================================');
            console.log(data.message);
            console.log('====================================');
            setLoading(false)
  
            toast(data.message);
            return
          }
          localStorage.setItem("limit", data.limit);
          const  aiResult = data.result.split(",");
          setResult(aiResult);
          console.log(aiResult);
          setLoading(false)
          setShowResult(true);
            
        }, "image/png");
      });
    
    } catch (error) {

      console.error(error);
    }
  };

  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing the camera: ", err);
      });
  }, []);

  return (
    <>
    <ToastContainer />
      <div className="relative h-screen flex flex-col items-center  ">
        <div className="absolute inset-0 bg-black z-10 opacity-60"></div>
        <div className="absolute inset-0  bg-gradient-to-r flex from-[#0c0b14] to-[#016875] "></div>
        <div className="relative z-10 text-center bg-[#000000] p-5 rounded-xl  border-black mt-14 ">
          <h1 className="lg:text-3xl font-bold text-white">
            🤖 I will tell your Expression by Analyze your face.
          </h1>
        </div>

        <div
          onClick={handleScan}
          className="cursor-pointer hover:bg-slate-400 lg:text-[20px]  font-bold z-10 text-center bg-[#dfcb8a] xs:p-1 lg:p-5 rounded-xl border-4 border-black mt-5 flex items-center justify-center"
        >
          <img className="w-[50px] mr-3" src={imageScan} alt="" />
          <p className="font-bold text-[15px]">Click to  Analyze your face</p>
        </div>

        <div className="image-area relative z-10 camera bg-[#f1f1ed] xs:w-[300px] lg:w-[499px] h-[380px] p-1 rounded-lg mt-[10px] border border-black">
          <video
            ref={videoRef}
            autoPlay
            className="w-full h-full rounded-2xl"
          ></video>
        </div>
        {showResult && (
          <div className="fixed   inset-0 flex items-center justify-center bg-gray-900/70 z-10">
            <div className="bg-white p-5 rounded-lg h-[400px]  xs:w-[350px] lg:w-[500px] shadow-lg flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center">
              <h1 className="lg:text-3xl font-bold text-center mb-1 "> Result </h1>
              <div className="w-[60%] h-1 flex items-center justify-center bg-[#000000]"></div>
              </div>
           
              <p className="text-center lg:text-[25px] font-bold ">
                Expression : {result[2]}
                <br />
                Emotion : {result[0]}
                <br />
                Dressing : {result[1]}
                <br />
                Location : {result[3]}
              </p>
              <div 
              onClick={() => setShowResult(false)}
              className="bg-[#8adf95] p-5 rounded-lg text-center cursor-pointer transition duration-300 ease-in-out    hover:bg-[#3f5364] font-bold shadow-lg">Try again</div>
            </div>
           
          </div>
        )}

        {loading && (
          <div className="fixed   inset-0 flex  items-center justify-center bg-gray-900/90 z-10">
            <div className="fixed items-center flex-col z-10 flex  mt-5">
              <h1 className="lg:text-xl font-bold text-white mb-5">
                Analyzing your face
              </h1>
              <ReactLoading
                type="spin"
                color="white"
                height={100}
                width={100}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Main;
