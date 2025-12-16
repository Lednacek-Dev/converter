import { useState } from "react";
import { ConverterHeader } from "../components/converter/ConverterHeader";
import { CurrencyList } from "../components/converter/CurrencyList";

export function CurrencyConverterPage() {
  const [amount, setAmount] = useState(1000);
  const [search, setSearch] = useState("");

  return (
    <>
      <ConverterHeader
        amount={amount}
        onAmountChange={setAmount}
        search={search}
        onSearchChange={setSearch}
      />
      <CurrencyList czkAmount={amount} search={search} />
    </>
  );
}
