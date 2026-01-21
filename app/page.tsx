import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Train = {
 name: string,
 arrivalTime: number,
 headsign: string,
}

function computeDelta(t1: Date, t2: Date) : number {
  const delta = (t1 - t2) / (1000 * 60);
  if (delta < 0) {
   return 1;
  }
  return Math.ceil(delta);
}

async function processTrainData(trains) : Array<Train> {
  const stopTimes = trains.stopTimes;
  const unique_trains = [];
  return stopTimes.map((stop) => {
    const trainId = stop.trip.route.id;
    const arrivalTime = computeDelta(new Date(parseInt(stop.arrival.time) * 1000), new Date()); 
    if(arrivalTime > 30) {
      return undefined;
    }
    return { value: {
     name: trainId,
     arrivalTime: arrivalTime,
     headsign: stop.headsign,
    }};
  }).filter((stop) => stop !== undefined).map(x => x.value);
} 


 
export default async function Home() {
  const data = await fetch('https://demo.transiter.dev/systems/us-ny-subway/stops/D15?include=stop_times');
  const json = await data.json();
  const trains: Array<Train> = await processTrainData(json);

  return (
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Train</TableHead>
      <TableHead>Direction</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {trains.map((train) => (
      <TableRow key={train.name}>
        <TableCell className="font-base">{train.name}</TableCell>
        <TableCell>{train.headsign}</TableCell>
        <TableCell>{train.arrivalTime} Minutes</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

  );
}
