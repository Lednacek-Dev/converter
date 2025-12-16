import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../../test/test-utils";
import { AppFavoriteButton } from "../../../components/common/AppFavoriteButton";

describe("AppFavoriteButton", () => {
  it("renders with unfavorited state", () => {
    render(<AppFavoriteButton isFavorite={false} onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("title", "Add to favorites");
  });

  it("renders with favorited state", () => {
    render(<AppFavoriteButton isFavorite={true} onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("title", "Remove from favorites");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<AppFavoriteButton isFavorite={false} onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("stops event propagation on click", () => {
    const handleClick = vi.fn();
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <AppFavoriteButton isFavorite={false} onClick={handleClick} />
      </div>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("accepts custom size prop", () => {
    render(<AppFavoriteButton isFavorite={false} onClick={() => {}} size={24} />);
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });
});
