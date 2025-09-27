import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ButtonUnit from "@/components/ButtonUnit/ButtonUnit";

// Мокаем провайдер
jest.mock("@/providers/StateProvider", () => ({
  useStateContext: () => ({
    setNodeToAdd: mockSetNodeToAdd,
  }),
}));

const mockSetNodeToAdd = jest.fn();

describe("ButtonUnit", () => {
  beforeEach(() => {
    mockSetNodeToAdd.mockClear();
  });

  it("рендерит текст info", () => {
    render(<ButtonUnit info="section" />);
    expect(screen.getByRole("button", { name: "section" })).toBeInTheDocument();
  });

  it("вызывает setNodeToAdd при клике", async () => {
    const user = userEvent.setup();
    render(<ButtonUnit info="div" />);
    await user.click(screen.getByRole("button", { name: "div" }));
    expect(mockSetNodeToAdd).toHaveBeenCalledWith("div");
  });
});
