/*export const degreeData = {
  "B.Tech": {
    years: ["1", "2", "3", "4"],
    branches: [
      "Bioengineering",
      "Bioinformatics",
      "Biotechnology",
      "Chemical Engineering",
      "Civil Engineering",
      "Computer Science and Engineering",
      "Computer Science and Engineering (Artificial Intelligence & Data Science)",
      "Computer Science and Engineering (Cyber Security & Blockchain Technology)",
      "Computer Science and Engineering (IoT & Automation)",
      "Computer Science and Engineering (Networks)",
      "Information and Communication Technology",
      "Information Technology",
      "Electrical and Electronics Engineering",
      "Electrical and Electronics Engineering (Smart Grid and Electric Vehicles)",
      "Electronics and Communication Engineering",
      "Electronics and Communication Engineering (Cyber Physical Systems)",
      "Electronics & Instrumentation Engineering",
      "Robotics & Artificial Intelligence",
      "Electronics Engineering (VLSI Design & Technology)",
      "Aerospace Engineering",
      "Mechanical Engineering",
      "Mechanical Engineering (Digital Manufacturing)",
      "Mechatronics"
    ]
  },

  "M.Tech": {
    years: ["1", "2"],
    branches: [
      "Aerospace Engineering",
      "Digital Manufacturing",
      "Artificial Intelligence and Data Science",
      "Computer Science and Engineering",
      "Cyber Security",
      "VLSI",
      "Artificial Intelligence & Robotics",
      "Power & Energy Systems",
      "Wireless Smart Communication",
      "Big Data Biology",
      "Industrial Biotechnology",
      "Medical Nanotechnology",
      "Structural Engineering"
    ]
  },

  "M.Tech 5-year Integrated": {
    years: ["1", "2"],
    branches: [
      "Integrated Biotechnology",
      "Integrated Medical Nanotechnology"
    ]
  },

  "M.Sc": {
    years: ["1", "2"],
    branches: [
      "Biotechnology",
      "Bioinformatics",
      "Chemistry",
      "Physics",
      "Data Science"
    ]
  },

  "MBA": {
    years: ["1", "2"],
    branches: ["Management"]
  },

  "MCA": {
    years: ["1", "2"],
    branches: ["Computer Applications"]
  },

  "BFA": {
    years: ["1", "2", "3", "4"],
    branches: ["Music", "Bharatanatyam"]
  },

  "MFA": {
    years: ["1", "2"],
    branches: ["Bharatanatyam"]
  },

  "MA": {
    years: ["1", "2"],
    branches: ["Divyaprabandhandam", "Sanskrit"]
  },

  "MA (5 Year Integrated)": {
    years: ["1", "2", "3", "4", "5"],
    branches: ["Sanskrit"]
  },

  "B. Optom": {
    years: ["1", "2", "3", "4"],
    branches: [
      "B.Optom [Collaboration with Elite School of Optometry, Sankara Nethralaya, Chennai]"
    ]
  },

  "M. Optom": {
    years: ["1", "2"],
    branches: [
      "M.Optom [Collaboration with Elite School of Optometry, Sankara Nethralaya, Chennai]"
    ]
  },

  "Law (5 Year Integrated)": {
    years: ["1", "2", "3", "4", "5"],
    branches: [
      "BA LLB [2022-27] / [2023-28] / [2024-29]",
      "BBA LLB [2022-27] / [2023-28] / [2024-29]",
      "B.Com LLB [2022-27] / [2023-28] / [2024-29]"
    ]
  },

  "M. Sc (5 Year Integrated)": {
    years: ["1", "2", "3", "4", "5"],
    branches: [
      "Integrated Biotechnology",
      "Integrated Physics",
      "Integrated Chemistry",
      "Integrated Mathematics",
      "Integrated Mathematics and Computing",
      "Integrated Data Science"
    ]
  },

  "B.Ed. (Integrated)": {
    years: ["1", "2", "3", "4"],
    branches: ["Physics", "Maths", "English"]
  }
};*/
export const degreeData = {
  "B.Tech": {
    semesters: ["1","2","3","4","5","6","7","8"],

    branches: {
      "COMMON": {
        appliesTo: "All Branches",
        semesters: { "1": [
          { code: "BIT101R01", name: "Biology for Engineers" },
          { code: "MAT101R01", name: "Engineering Mathematics-I" },
          { code: "CSE101", name: "Program solving 7 programming in C" },
          { code: "CHY101", name: "Engineering Chemistry" },
          { code: "EIE101R01", name: "Basic Electronics Engineering" },
          {code:"MEC101" ,name:"Basic Mechanical Engineering"},
          { code: "CIV103", name: "Engineering Graphics" }],
          
          "2": [{ code: "ENG101R01", name: "Technical Communication" },
                { code:"MAT101R01",name:"Engineering Mathematics-I" },
                { code: "CSE101", name: "Problem solving 7 programming in C" },
                { code: "PHY101R01", name: "Engineering Physics" },
                { code: "EEE101", name: "Basic Electrical Engineering" },
                { code: "CIV101", name: "Basic Civil Engineering" },
                {code:"CIV102",name:"Engineering Mechanics"},
                {code:"MEC102",name:"Intoduction to Engineering Design"}] }
      },

      "Bioengineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Bioinformatics": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Biotechnology": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Chemical Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Civil Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Computer Science and Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
     "Computer Science and Engineering (Artificial Intelligence & Data Science)": {
  semesters: {

    "3": [
      { code: "MAT201R01", name: "Engineering Mathematics – III" },
      { code: "CSE208", name: "Java Programming" },
      { code: "CSE105", name: "Computer Organization" },
      { code: "CSE103R01", name: "Data Structures" },
      { code: "ECE101R01", name: "Digital System Design" },
      { code: "CSE104R01", name: "Data Structures Laboratory" },
      { code: "ECE103", name: "Digital System Design Laboratory" }
    ],

    "4": [
      { code: "MAT302", name: "Discrete Structures" },
      { code: "CSE305R01", name: "Design & Analysis of Algorithms" },
      { code: "INT102R01", name: "Fundamentals of Database Management Systems" },
      { code: "CSE205R02", name: "Computer Architecture" },
      { code: "CSE304", name: "Python Programming with Web Frameworks" },
      { code: "CSE206R02", name: "Computer System Design Laboratory" },
      { code: "CSE306R01", name: "Design & Analysis of Algorithms Laboratory" }
    ],

    "5": [
      { code: "CSE324", name: "Fundamentals of AI & Data Science" },
      { code: "CSE302", name: "Computer Networks" },
      { code: "CSE308", name: "Operating Systems" },
      { code: "CSE325", name: "AI & Data Science Laboratory" },
      { code: "CSE303", name: "Computer Networks Laboratory" },
      { code: "TNP101R01", name: "Soft Skills – I" }
    ],

    "6": [
      { code: "INT405R02", name: "Machine Learning Techniques" },
      { code: "CSE432R01", name: "Time Series & Sequential Data Analytics" },
      { code: "INT303R01", name: "Data Warehousing & Data Mining" },
      { code: "INT407", name: "Machine Learning Laboratory" },
      { code: "CSE433", name: "Time Series & Sequential Data Analytics Laboratory" },
      { code: "TNP102R01", name: "Soft Skills – II" },
      { code: "CSE300", name: "Mini Project" }
    ],

    "7": [
      { code: "INT404R01", name: "Big Data Analytics" },
      { code: "CSE437", name: "Deep Learning Essentials" },
      { code: "MAT449", name: "Optimization Techniques for Data Science" },
      { code: "MAN105", name: "Professional Ethics" },
      { code: "INT435", name: "Big Data Analytics & Applications Laboratory" },
      { code: "CSE438", name: "Deep Learning Essentials Laboratory" }
    ],

    "8": [
      { code: "OEXXXX", name: "Open Elective" },
      { code: "OEXXXX", name: "Open Elective" },
      { code: "OEXXXX", name: "Open Elective" },
      { code: "CSE400", name: "Project & Viva Voce" }
    ]

  }
},
      "Computer Science and Engineering (Cyber Security & Blockchain Technology)": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Computer Science and Engineering (IoT & Automation)": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Computer Science and Engineering (Networks)": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Information and Communication Technology": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Information Technology": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Electrical and Electronics Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Electrical and Electronics Engineering (Smart Grid and Electric Vehicles)": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Electronics and Communication Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Electronics and Communication Engineering (Cyber Physical Systems)": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Electronics & Instrumentation Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Robotics & Artificial Intelligence": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Electronics Engineering (VLSI Design & Technology)": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Aerospace Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Mechanical Engineering": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Mechanical Engineering (Digital Manufacturing)": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Mechatronics": { semesters: { "3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }}
    }
  },

  "M.Tech": {
    semesters: ["1","2","3","4"],
    branches: {
      "Aerospace Engineering": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Digital Manufacturing": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Artificial Intelligence and Data Science": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Computer Science and Engineering": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Cyber Security": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "VLSI": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Artificial Intelligence & Robotics": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Power & Energy Systems": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Wireless Smart Communication": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Big Data Biology": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Industrial Biotechnology": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Medical Nanotechnology": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Structural Engineering": { semesters: { "1": [],"2": [],"3": [],"4": [] }}
    }
  },

  "M.Tech 5-year Integrated": {
    semesters: ["1","2","3","4","5","6","7","8","9","10"],
    branches: {
      "Integrated Biotechnology": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "Integrated Medical Nanotechnology": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }}
    }
  },

  "M.Sc": {
    semesters: ["1","2","3","4"],
    branches: {
      "Biotechnology": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Bioinformatics": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Chemistry": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Physics": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Data Science": { semesters: { "1": [],"2": [],"3": [],"4": [] }}
    }
  },

  "MBA": {
    semesters: ["1","2","3","4"],
    branches: {
      "Management": { semesters: { "1": [],"2": [],"3": [],"4": [] }}
    }
  },

  "MCA": {
    semesters: ["1","2","3","4"],
    branches: {
      "Computer Applications": { semesters: { "1": [],"2": [],"3": [],"4": [] }}
    }
  },

  "BFA": {
    semesters: ["1","2","3","4","5","6","7","8"],
    branches: {
      "Music": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Bharatanatyam": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }}
    }
  },

  "MFA": {
    semesters: ["1","2","3","4"],
    branches: {
      "Bharatanatyam": { semesters: { "1": [],"2": [],"3": [],"4": [] }}
    }
  },

  "MA": {
    semesters: ["1","2","3","4"],
    branches: {
      "Divyaprabandhandam": { semesters: { "1": [],"2": [],"3": [],"4": [] }},
      "Sanskrit": { semesters: { "1": [],"2": [],"3": [],"4": [] }}
    }
  },

  "MA (5 Year Integrated)": {
    semesters: ["1","2","3","4","5","6","7","8","9","10"],
    branches: {
      "Sanskrit": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }}
    }
  },

  "B. Optom": {
    semesters: ["1","2","3","4","5","6","7","8"],
    branches: {
      "B.Optom [Collaboration with Elite School of Optometry, Sankara Nethralaya, Chennai]": {
        semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }
      }
    }
  },

  "M. Optom": {
    semesters: ["1","2","3","4"],
    branches: {
      "M.Optom [Collaboration with Elite School of Optometry, Sankara Nethralaya, Chennai]": {
        semesters: { "1": [],"2": [],"3": [],"4": [] }
      }
    }
  },

  "Law (5 Year Integrated)": {
    semesters: ["1","2","3","4","5","6","7","8","9","10"],
    branches: {
      "BA LLB [2022-27] / [2023-28] / [2024-29]": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "BBA LLB [2022-27] / [2023-28] / [2024-29]": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "B.Com LLB [2022-27] / [2023-28] / [2024-29]": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }}
    }
  },

  "M. Sc (5 Year Integrated)": {
    semesters: ["1","2","3","4","5","6","7","8","9","10"],
    branches: {
      "Integrated Biotechnology": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "Integrated Physics": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "Integrated Chemistry": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "Integrated Mathematics": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "Integrated Mathematics and Computing": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }},
      "Integrated Data Science": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [],"9": [],"10": [] }}
    }
  },

  "B.Ed. (Integrated)": {
    semesters: ["1","2","3","4","5","6","7","8"],
    branches: {
      "Physics": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "Maths": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }},
      "English": { semesters: { "1": [],"2": [],"3": [],"4": [],"5": [],"6": [],"7": [],"8": [] }}
    }
  }
};