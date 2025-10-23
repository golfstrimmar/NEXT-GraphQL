export interface PProjectDataElement {
  type: string;
  attributes: {
    tag: string;
    text: string;
    class: string;
    style: string;
  };
}

export default interface PProject {
  id: string;
  name: string;
  data: PProjectDataElement[];
  owner: {
    id: string;
    username: string;
    email?: string;
  };
}
