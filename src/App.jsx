import { useState } from "react";

//Nils was here(lecture pull request task)

//Define our variables for Azure access
const ApiKey = import.meta.env.VITE_API_KEY;
const AzureEndpoint = import.meta.env.VITE_ENDPOINT_NAME;

function App() {
  //in React we can use setState to define the state of changing variables
  const [data, setData] = useState();
  const [image, setImage] = useState(
    "https://www.toyota.co.nz/globalassets/new-vehicles/camry/2021/camry-zr-axhzr-nm1-axrzr-nm1/clear-cuts/updated-clear-cuts/camry-zr-eclipse.png",
  );
  const [displayMsg, setDisplayMsg] = useState("Click run!"); //set a display message that can be updated

  //we  want to ensure we manage the user changing the input field so this will update the image useState
  const handleOnChange = (e) => {
    setImage(e.target.value);
  };

  //when the user clicks the button, we will initiate our call to the API
  //once the data has been fetched, it will setData with the data useState
  const onButtonClick = async (e) => {
    // e represents the click/event, preventDefault stops the buttons from acting like a default button as we are using it asynchronously
    e.preventDefault();
    //return the state of data to void so that if the fetch fails, displayMsg will display using && in html
    setData();
    setDisplayMsg("Loading...");
    console.log("Click registered and ready to fetch!");

    //add some error handling to ensure the user enters the correct url format otherwise we waste server querys
    if (
      !image ||
      !(
        image.endsWith(".jpg") ||
        image.endsWith(".jpeg") ||
        image.endsWith(".png") ||
        image.endsWith(".webp")
      )
    ) {
      setImage();
      setDisplayMsg("Invalid image format or url");
    } else {
      try {
        const fetchOptions = {
          method: "POST",
          timeout: 50000,
          headers: {
            "Ocp-Apim-Subscription-Key": ApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: image,
          }),
        };

        const response = await fetch(
          `${AzureEndpoint}computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=tags,caption`,
          fetchOptions,
        );
        const parsedData = await response.json();
        //setData so we can now call the resJson as a variable called 'data' as defined in setData useState
        setData(parsedData);
        //by checking the console we can see the raw json data and structure to make building our html easier
        console.log(parsedData);
      } catch (error) {
        console.error("There is an error during fetch:", error);
        setDisplayMsg("Sorry, there was an error.", error);
      }
    }
  };

  return (
    <div className="bg-[#0b0f51] text-stone-200 min-h-screen w-full font-inter flex flex-col items-center">
      <div className="flex flex-col justify-center">
        <h1 className="flex font-bold text-6xl py-6">
          Image Recognition Service
        </h1>
      </div>

      <div className="flex flex-col justify-center items-center py-6 space-y-4 w-1/4 ">
        <input
          className="bg-slate-300 text-black inline-block px-2 py-1 w-full rounded-xl "
          placeholder="Enter image URL"
          value={image}
          onChange={handleOnChange}
        />
        <button
          className="inline-block w-1/3 px-2 py-1 font-semibold bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl drop-shadow-md mt-2 md:mt-0"
          onClick={onButtonClick}
        >
          Run Service
        </button>
      </div>

      {/* Start of results area */}
      <section className="flex flex-col items-center justify-center">
        {image && <img src={image} width={320} height={180} alt={image} />}
        <p className="text-xl font-semibold">
          {data && data.captionResult.text}
        </p>

        {data &&
        data.tagsResult &&
        data.tagsResult.values.some((item) => item.name === "car") ? (
          <ul>
            {data.tagsResult.values.map((item) => (
              <li key={item.name}>
                <span>
                  {item.name} - Confidence level{" "}
                  {parseInt(item.confidence * 100)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div>{displayMsg && <p>{displayMsg}</p>}</div>
        )}
      </section>
    </div>
  );
}

export default App;
