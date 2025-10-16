export interface CardLink {
  to?: string;
  text: string;
}

export interface ModalIntro {
  highlight: string;
  text: string;
  additionalText?: string;
}

export interface ModalSolution {
  icon?: string;
  title?: string;
  text: string;
}

export interface ModalProcedure {
  title?: string;
  description: string;
  benefits?: string;
}

export interface CustomSection {
  title?: string;
  content: string;
}

export interface ModalContent {
  title: string;
  headerIcon?: string;
  intro?: ModalIntro;
  solution?: ModalSolution;
  procedure?: ModalProcedure;
  customSections?: CustomSection[];
  procedureConsistOf?: ProcedureConsistOf;
}

export interface ProcedureConsistOf {
  text: string;
  additionalText?: string;
}

export interface CardData {
  id: string;
  icon: string;
  title: string;
  description: string;
  link?: CardLink;
  modalContent?: ModalContent;
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  cards: CardData[];
}
