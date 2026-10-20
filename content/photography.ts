// Authentic public-domain photography only. Each entry records who made the image,
// when, and where the unaltered original can be inspected. Files in
// public/assets/photography are resized and compressed copies; they are never
// retouched, recomposed, or AI-generated. Grading happens in CSS overlays.
export type Photograph = {
  id: string;
  alt: string;
  caption: string;
  credit: string;
  date: string;
  location: string;
  releaseId?: string;
  sourceUrl: string;
  rights: string;
  width: number;
  height: number;
};

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const USAF_RIGHTS = "U.S. Air Force photograph. Work of the U.S. federal government; public domain.";

export const PHOTOGRAPHS = {
  "c17-dusk": {
    id: "c17-dusk",
    alt: "A C-17 Globemaster III on a flight line at dusk, seen head-on beneath a deep blue and orange sky.",
    caption: "A C-17 Globemaster III on the flight line at sunrise.",
    credit: "U.S. Air Force photo by Staff Sgt. Caleb Roland",
    date: "21 February 2024",
    location: "U.S. Central Command area of responsibility",
    releaseId: "240221-F-YD471-1012",
    sourceUrl: `${COMMONS}C-17_Loading_in_CENTCOM_AOR_(8818643).jpg`,
    rights: USAF_RIGHTS,
    width: 2400,
    height: 1597,
  },
  "hangar-t6": {
    id: "hangar-t6",
    alt: "A T-6A Texan II framed by two steel hangar arches under a violet evening sky.",
    caption: "A T-6A Texan II on the flight line, Vance Air Force Base.",
    credit: "U.S. Air Force photo by 2nd Lt. Connor Brezenski",
    date: "29 October 2025",
    location: "Vance Air Force Base, Oklahoma",
    releaseId: "251029-F-RP991-1001",
    sourceUrl: `${COMMONS}T-6_Flightline_Sunset_(9373811).jpg`,
    rights: USAF_RIGHTS,
    width: 2400,
    height: 1600,
  },
  "academy-chapel": {
    id: "academy-chapel",
    alt: "The Cadet Chapel at the U.S. Air Force Academy, a row of aluminum-clad tetrahedral spires against a deep blue sky.",
    caption: "The Cadet Chapel, U.S. Air Force Academy. Walter Netsch for Skidmore, Owings & Merrill, 1962.",
    credit: "Carol M. Highsmith, Library of Congress",
    date: "18 June 2007",
    location: "Colorado Springs, Colorado",
    releaseId: "highsm.04090",
    sourceUrl: `${COMMONS}Air_Force_Academy_Chapel,_Colorado_Springs,_CO_04090u_original.jpg`,
    rights: "Photograph by Carol M. Highsmith, who dedicated her work to the public domain through the Library of Congress.",
    width: 2400,
    height: 1788,
  },
  "airman-laptop": {
    id: "airman-laptop",
    alt: "An Airman crouches beside an aircraft in a dim hangar, reading a ruggedized laptop.",
    caption: "Senior Airman Erik Brown, 86th Aircraft Maintenance Squadron, reviews repair information on a work laptop.",
    credit: "U.S. Air Force photo by Airman 1st Class Jordan Lazaro",
    date: "7 November 2022",
    location: "Ramstein Air Base, Germany",
    releaseId: "221107-F-XE065-1106",
    sourceUrl: `${COMMONS}86th_AMXS_ensure_aircraft_operability_(7499901).jpg`,
    rights: USAF_RIGHTS,
    width: 2400,
    height: 1600,
  },
  "cyber-operator": {
    id: "cyber-operator",
    alt: "A technical sergeant works at a bank of monitors in a cyber operations cell while a colleague sits behind him.",
    caption: "Cyber defense Airmen train during a defensive cyber operations exercise.",
    credit: "U.S. Air Force photo by Master Sgt. Renae Pittman",
    date: "8 March 2019",
    location: "Ramstein Air Base, Germany",
    releaseId: "190308-F-FF603-0008",
    sourceUrl: `${COMMONS}Cyber_Airmen_further_defensive_cyber_operations_skills_(5167009).jpg`,
    rights: USAF_RIGHTS,
    width: 2400,
    height: 1600,
  },
  "b2-night": {
    id: "b2-night",
    alt: "A B-2 Spirit under tow at night, crew chiefs walking beside it on a floodlit taxiway.",
    caption: "Crew chiefs prepare a B-2 Spirit to be towed into a hangar.",
    credit: "U.S. Air Force photo by Staff Sgt. Kayla White",
    date: "27 August 2019",
    location: "RAF Fairford, England",
    releaseId: "190827-F-XF897-1016",
    sourceUrl: `${COMMONS}B-2_Spirits,_Whiteman_AFB_Airmen_arrive_at_RAF_Fairford_for_Bomber_Task_Force_deployment_(5702835).jpg`,
    rights: USAF_RIGHTS,
    width: 2400,
    height: 1544,
  },
} as const satisfies Record<string, Photograph>;

export type PhotographId = keyof typeof PHOTOGRAPHS;
