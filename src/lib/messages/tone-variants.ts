import type { MessageTone } from "./types";

type ToneVariant = {
  subjectPrefix: string;
  opener: string;
  request: string;
  closingLine: string;
};

export const toneVariants: Record<MessageTone, ToneVariant> = {
  neutral: {
    subjectPrefix: "Täydennyspyyntö",
    opener: "Huomasimme palkka-aineistossa kohdan, joka tarvitsee vielä vahvistuksen.",
    request: "Voisitko toimittaa puuttuvat tiedot, jotta voimme viimeistellä palkanlaskennan?",
    closingLine: "Ystävällisin terveisin,\nPalkanlaskenta",
  },
  polite_urgent: {
    subjectPrefix: "Kiireellinen täydennyspyyntö",
    opener: "Huomasimme palkka-aineistossa kohdan, joka on hyvä vahvistaa mahdollisimman pian.",
    request:
      "Pyydämme toimittamaan puuttuvat tiedot pikaisesti, jotta palkan käsittely ei viivästy.",
    closingLine: "Ystävällisin terveisin,\nPalkanlaskenta",
  },
} as const;

export function getToneVariant(tone: MessageTone) {
  return toneVariants[tone];
}
