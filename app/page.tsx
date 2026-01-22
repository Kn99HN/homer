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

const boroughHall_1 = "232";
const boroughHall_2 = "423";
const jaySt = "A41";
const hoytSchemahorn = "A42";
const exclusions = {
 [hoytSchemahorn]: new Set(["A", "C"])
}

type Train = {
 id: string,
 name: string,
 station: string,
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
  const uniqueTrains = new Set();
  return stopTimes.map((stop) => {
    const trainId = stop.trip.route.id;
    const tripId = stop.trip.id;
    const arrivalTime = computeDelta(new Date(parseInt(stop.arrival.time) * 1000), new Date()); 
    if(arrivalTime > 30) {
      return undefined;
    }
    const uniqueTrainId = trainId + "-" + stop.headsign;
    if (uniqueTrains.has(uniqueTrainId)) {
      return undefined;
    }
    if(exclusions[trains.id] !== undefined && exclusions[trains.id].has(trainId)) {
      return undefined;
    }
    uniqueTrains.add(uniqueTrainId);
    return { value: {
     id: tripId,
     station: trains.name,
     name: trainId,
     arrivalTime: arrivalTime,
     headsign: stop.headsign,
    }};
  }).filter((stop) => stop !== undefined).map(x => x.value);
}

async function getTrainSchedule(stop: string) : Array<Train> {
  const data = await fetch('https://demo.transiter.dev/systems/us-ny-subway/stops/' + stop + '?include=stop_times');
  const json = await data.json();
  return processTrainData(json);
}



export default async function Home() {
  const trainsPromises = [ boroughHall_1, boroughHall_2, jaySt, hoytSchemahorn ].map((train) => {
  return getTrainSchedule(train);
  });
  const trains = (await Promise.all(trainsPromises)).flat().sort((t1, t2) => {
    return t1.arrivalTime - t2.arrivalTime;
  });

  return (
  <div classname="min-h-screen bg-neutral-100 grid place-items-center">
        <div className="w-fit mx-auto bg-white border-4 border-black shadow-[8px_8px_0_0_#000]">
<Table classname="w-fit mx-auto inline-table border-collapse">
  <TableHeader classname="font-heading border-b-4 border-black">
    <TableRow>
      <TableHead className="w-[100px]">Station</TableHead>
      <TableHead classname="border-r-2 border-black bg-yellow-300 text-black font-bold uppercase last:border-r-0">Train</TableHead>
      <TableHead classname="border-r-2 border-black bg-yellow-300 text-black font-bold uppercase last:border-r-0">Direction</TableHead>
      <TableHead classname="border-r-2 border-black bg-yellow-300 text-black font-bold uppercase last:border-r-0">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {trains.map((train) => (
      <TableRow key={train.id}>
        <TableCell className="font-base">{train.station}</TableCell>
        <TableCell>{train.name}</TableCell>
        <TableCell>{train.headsign}</TableCell>
        <TableCell>{train.arrivalTime} Minutes</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
</div>
</div>
  );
}
