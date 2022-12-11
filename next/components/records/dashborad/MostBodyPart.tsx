import { Position } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { PieChart, Pie, Sector } from "recharts";
import { KoreanPosition } from "types/write";

interface ThreeMonthResponse {
  position: Position;
  userLength?: number;
  hospitalLength?: number;
}

interface MostBodyPartChartProps {
  chartData: ThreeMonthResponse[] | null;
  mostPartIdx: number[] | null;
}

interface PieChartData {
  name: Position;
  value: number;
  user: number;
  hospital: number;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, payload } = props;

  return (
    <g>
      <text x={cx} y={cy - 35} dy={8} textAnchor="middle" fill={"#363CBF"} fontSize={"22px"} fontWeight={700}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={"#363CBF"} fontSize={"16px"}>
        증상기록 {payload.user}건
      </text>
      <text x={cx} y={cy + 40} dy={8} textAnchor="middle" fill={"#363CBF"} fontSize={"16px"}>
        병원방문 {payload.hospital}건
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={"#5359E9"}
      />
    </g>
  );
};

const MostBodyPart = ({ chartData, mostPartIdx }: MostBodyPartChartProps) => {
  const [pieChartData, setPieChartData] = useState<any>(); // 여기 any
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    if (chartData) {
      setPieChartData(() =>
        chartData.map((ele: ThreeMonthResponse) => ({
          name: KoreanPosition[ele.position],
          value: ele.userLength,
          user: ele.userLength ? ele.userLength : 0,
          hospital: ele.hospitalLength ? ele.hospitalLength : 0,
        })),
      );
    }

    if (mostPartIdx) {
      setActiveIndex(mostPartIdx[0]);
    }
  }, [chartData]);

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex],
  );

  return (
    <PieChart width={360} height={360}>
      <Pie
        data={pieChartData}
        activeIndex={activeIndex}
        activeShape={renderActiveShape}
        cx={180}
        cy={170}
        innerRadius={130}
        outerRadius={170}
        fill="#D9DEFF"
        paddingAngle={pieChartData && pieChartData.length < 2 ? 0 : 2}
        dataKey="value"
        onMouseEnter={onPieEnter}
      />
    </PieChart>
  );
};

export default MostBodyPart;
