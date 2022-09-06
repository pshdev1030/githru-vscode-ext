import { select } from "d3";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";

import type { ClusterNode } from "types";
import type { GlobalProps } from "types/global";

const filterData = (data: ClusterNode[]): any => {
  const dateMap = new Map();

  data.forEach((cluster) => {
    const commitLength = cluster.commitNodeList.length;

    cluster.commitNodeList
      .filter((commitNode) => commitNode.nodeTypeName === "COMMIT")
      .forEach((commitNode) => {
        // 날짜 계산
        const { commitDate } = commitNode.commit;
        const formattedCommitDate = dayjs(commitDate).format("YYYY MM DD");

        // cloc 계산
        const { insertions, deletions } = commitNode.commit.diffStatistics;
        const cloc = insertions + deletions;

        // mapItem 만들기
        const mapItem = dateMap.get(formattedCommitDate) || {};

        mapItem.cloc = mapItem.cloc + cloc || cloc;
        mapItem.commit = mapItem.commit + commitLength || commitLength;

        dateMap.set(formattedCommitDate, mapItem);
      });
  });

  return Array.from(dateMap.entries()).sort((a, b) => dayjs(a[0]).diff(b[0]));
};

const TemporalFilter = ({ data }: GlobalProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    console.log(filterData(data));

    const svg = select(svgRef.current);

    const { width, height } =
      wrapperRef.current && wrapperRef.current.getBoundingClientRect();

    svg.attr("width", width).attr("height", height);
  }, [data]);

  return (
    <div ref={wrapperRef}>
      <svg ref={svgRef} />
    </div>
  );
};

export default TemporalFilter;
