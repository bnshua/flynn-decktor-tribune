interface WeatherBoxProps {
  forecast?: string;
  temperature?: string;
  conditions?: string;
}

const WeatherBox = ({ 
  forecast = "EMPTY", 
  temperature = "EMPTY",
  conditions = "EMPTY"
}: WeatherBoxProps) => {
  const isEmpty = forecast === "EMPTY";

  return (
    <div className="border-2 border-ink p-4 text-center">
      <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-3 border-b border-rule pb-2">
        Today's Weather
      </h4>
      
      <div className="space-y-2">
        <p className={`font-body text-2xl font-semibold ${isEmpty ? "text-ink-light italic" : "text-headline"}`}>
          {temperature}
        </p>
        <p className={`font-body ${isEmpty ? "text-ink-light italic" : "text-ink"}`}>
          {conditions}
        </p>
        <div className="newspaper-rule my-2" />
        <p className={`font-body text-sm ${isEmpty ? "text-ink-light italic" : "text-ink-light"}`}>
          {forecast}
        </p>
      </div>
    </div>
  );
};

export default WeatherBox;
