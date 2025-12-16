import { describe, it, expect, spyOn } from "bun:test";
import {
  formatDateForCNB,
  formatDateForDB,
  parseCNBResponse,
} from "../../services/cnb";

describe("CNB Service", () => {
  describe("formatDateForCNB", () => {
    it("formats date correctly for CNB API", () => {
      const date = new Date("2024-12-15T12:00:00Z");
      expect(formatDateForCNB(date)).toBe("15.12.2024");
    });

    it("pads single digit day and month", () => {
      const date = new Date("2024-01-05T12:00:00Z");
      expect(formatDateForCNB(date)).toBe("05.01.2024");
    });

    it("handles end of year date", () => {
      const date = new Date("2024-12-31T12:00:00Z");
      expect(formatDateForCNB(date)).toBe("31.12.2024");
    });

    it("handles beginning of year date", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      expect(formatDateForCNB(date)).toBe("01.01.2024");
    });
  });

  describe("formatDateForDB", () => {
    it("formats date in ISO format for database", () => {
      const date = new Date("2024-12-15T12:00:00Z");
      expect(formatDateForDB(date)).toBe("2024-12-15");
    });

    it("handles different dates correctly", () => {
      const date = new Date("2024-01-05T00:00:00Z");
      expect(formatDateForDB(date)).toBe("2024-01-05");
    });
  });

  describe("parseCNBResponse", () => {
    const sampleCNBResponse = `15 Dec 2024 #242
Country|Currency|Amount|Code|Rate
Australia|dollar|1|AUD|14.567
EMU|euro|1|EUR|25.500
Japan|yen|100|JPY|15.234
USA|dollar|1|USD|23.456`;

    it("parses date correctly", () => {
      const result = parseCNBResponse(sampleCNBResponse);
      expect(result.date).toBe("2024-12-15");
    });

    it("parses all currencies", () => {
      const result = parseCNBResponse(sampleCNBResponse);
      expect(result.rates.length).toBe(4);
    });

    it("parses currency details correctly", () => {
      const result = parseCNBResponse(sampleCNBResponse);

      const eur = result.rates.find((r) => r.currencyCode === "EUR");
      expect(eur).toBeDefined();
      expect(eur?.country).toBe("EMU");
      expect(eur?.currencyName).toBe("euro");
      expect(eur?.amount).toBe(1);
      expect(eur?.rate).toBe(25.5);
    });

    it("parses multi-unit currencies correctly", () => {
      const result = parseCNBResponse(sampleCNBResponse);

      const jpy = result.rates.find((r) => r.currencyCode === "JPY");
      expect(jpy).toBeDefined();
      expect(jpy?.amount).toBe(100);
      expect(jpy?.rate).toBe(15.234);
    });

    it("handles single digit day in date", () => {
      const response = `5 Jan 2024 #5
Country|Currency|Amount|Code|Rate
USA|dollar|1|USD|23.456`;

      const result = parseCNBResponse(response);
      expect(result.date).toBe("2024-01-05");
    });

    it("handles all months correctly", () => {
      const months = [
        { name: "Jan", num: "01" },
        { name: "Feb", num: "02" },
        { name: "Mar", num: "03" },
        { name: "Apr", num: "04" },
        { name: "May", num: "05" },
        { name: "Jun", num: "06" },
        { name: "Jul", num: "07" },
        { name: "Aug", num: "08" },
        { name: "Sep", num: "09" },
        { name: "Oct", num: "10" },
        { name: "Nov", num: "11" },
        { name: "Dec", num: "12" },
      ];

      for (const { name, num } of months) {
        const response = `15 ${name} 2024 #1
Country|Currency|Amount|Code|Rate
USA|dollar|1|USD|23.456`;

        const result = parseCNBResponse(response);
        expect(result.date).toBe(`2024-${num}-15`);
      }
    });

    it("throws error for invalid date format", () => {
      const invalidResponse = `Invalid Date Format
Country|Currency|Amount|Code|Rate
USA|dollar|1|USD|23.456`;

      expect(() => parseCNBResponse(invalidResponse)).toThrow();
    });

    it("throws error for unknown month", () => {
      const invalidResponse = `15 Foo 2024 #1
Country|Currency|Amount|Code|Rate
USA|dollar|1|USD|23.456`;

      expect(() => parseCNBResponse(invalidResponse)).toThrow("Unknown month");
    });

    it("skips invalid rate lines", () => {
      const response = `15 Dec 2024 #1
Country|Currency|Amount|Code|Rate
USA|dollar|1|USD|23.456
Invalid|Line|Without|Proper|Format|Extra
Australia|dollar|1|AUD|14.567`;

      const result = parseCNBResponse(response);
      expect(result.rates.length).toBe(2);
    });

    it("skips lines with NaN values", () => {
      const consoleSpy = spyOn(console, "warn").mockImplementation(() => {});
      const response = `15 Dec 2024 #1
Country|Currency|Amount|Code|Rate
USA|dollar|1|USD|23.456
Invalid|data|abc|XXX|not-a-number
Australia|dollar|1|AUD|14.567`;

      const result = parseCNBResponse(response);
      expect(result.rates.length).toBe(2);
      consoleSpy.mockRestore();
    });

    it("handles comma as decimal separator", () => {
      const response = `15 Dec 2024 #1
Country|Currency|Amount|Code|Rate
USA|dollar|1|USD|23,456`;

      const result = parseCNBResponse(response);
      expect(result.rates[0].rate).toBe(23.456);
    });

    it("handles empty lines", () => {
      const response = `15 Dec 2024 #1
Country|Currency|Amount|Code|Rate

USA|dollar|1|USD|23.456

Australia|dollar|1|AUD|14.567
`;

      const result = parseCNBResponse(response);
      expect(result.rates.length).toBe(2);
    });

    it("trims whitespace from values", () => {
      const response = `15 Dec 2024 #1
Country|Currency|Amount|Code|Rate
  USA  |  dollar  |  1  |  USD  |  23.456  `;

      const result = parseCNBResponse(response);
      expect(result.rates[0].country).toBe("USA");
      expect(result.rates[0].currencyName).toBe("dollar");
      expect(result.rates[0].currencyCode).toBe("USD");
    });
  });
});
