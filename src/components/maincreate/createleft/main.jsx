import "./main.css";

import { MusicNote, Videocam, Movie, SportsEsports, HourglassBottom, ArrowLeft, ArrowRight } from "@mui/icons-material";

import { useRef, useState, useEffect } from "react";

const _categories = [
  {
    name: "Music",
    icon: <MusicNote />
  },
  {
    name: "Movies",
    icon: <Videocam />
  },
  {
    name: "TV Shows",
    icon: <Movie />
  },
  {
    name: "Video Games",
    icon: <SportsEsports />
  },
  {
    name: "Coming soon...",
    icon: <HourglassBottom />
  }
]

const _generes = [
  {
    name: "Rock",
    icon: <MusicNote />
  },
  {
    name: "Pop",
    icon: <MusicNote />
  },
  {
    name: "Jazz",
    icon: <MusicNote />
  },
  {
    name: "Classical",
    icon: <MusicNote />
  },
  {
    name: "Hip Hop",
    icon: <MusicNote />
  },
  {
    name: "Rap",
    icon: <MusicNote />
  },
  {
    name: "Country",
    icon: <MusicNote />
  },
  {
    name: "Metal",
    icon: <MusicNote />
  },
  {
    name: "Japanese",
    icon: <MusicNote />
  },
  {
    name: "Korean",
    icon: <MusicNote />
  },
]

// function ScrollButtons({ showScrollButtons }) {
//   if (showScrollButtons) {
//     return (
//       <>
//         <div className="categoryScrollButtonRight">
//           <ArrowRight />
//         </div>
//         <div className="categoryScrollButtonLeft">
//           <ArrowLeft />
//         </div>
//       </>
//     )
//   } else {
//     return null;
//   }
// }

function CreateLobbyLeft() {
  const [categories, setCategories] = useState(_categories);
  const [generes, setGeneres] = useState(_generes);
  // const [showScrollButtons, setShowScrollButtons] = useState(false);
  const genereRef = useRef(null);
  const categoryRef = useRef(null);

  const handleScrollCategory = (e) => {
    categoryRef.current.scrollLeft += e.deltaY;
  }

  const handleScrollGenere = (e) => {
    var currentScroll = Number((genereRef.current.style.right).split("px")[0]);
    currentScroll += e.deltaY;
    genereRef.current.style.right = currentScroll + "px";
  }

  return (
    <div className="createLeftContainer">
      <div className="createSelectCategory" onWheel={handleScrollCategory} ref={categoryRef}>
        {
          categories.map((category, index) => {
            return (
              <div className="category" key={index}>
                <div className="categoryIcon">
                  {category.icon}
                </div>
                <div className="createCategoryName">
                  {category.name}
                </div>
              </div>
            )
          })
        }
        {
        /*
          <ScrollButtons
            showScrollButtons={showScrollButtons}
          />
        */
        }
      </div>
      <div className="createSelectGenere" onWheel={handleScrollGenere} ref={genereRef}>
        {
          generes.map((genere, index) => {
            return (
              <div className="genere" key={index}>
                <div className="genereIcon">
                  {genere.icon}
                </div>
                <div className="createGenereName">
                  {genere.name}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CreateLobbyLeft;