import { Radio, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { RadioChangeEvent } from "antd/lib/radio";
import React, { useState } from "react";
import Axios from "axios";

const VARIABLES = ["UNR", "NLGQ", "PCORE_YTYPCT", "CBGDPR"];

const query = (measurement: string) => `{
  beforeCovid: findForecasts(
    where: { 
        and: [
            { code: { eq: "${measurement}" } }, 
            { edition: { eq: "EO107_1" } },
            { time: { eq: "2020" } }
        ] 
    }
  ) {
    id
    before:value
    description
    time
    country {
      name
      id
    }
  }

  afterCovid: findForecasts(
    where: { 
        and: [
            { code: { eq: "${measurement}" } }, 
            { edition: { eq: "EO107_2" } },
            { time: { eq: "2020" } }
        ] 
    }
  ) {
    after:value
  }
}
`;

interface HomePageProps {
  datasource: {
    before: number;
    after: number;
    change: number;
    description: string;
    time: string;
    country: {
      name: string;
      id: string;
    };
  }[];
  isLoading: boolean;
  cache: any;
  measurement: "UNR" | "NLGQ" | "PCORE_YTYPCT" | "CBGDPR";
}

const valueFormatter = (key: string) => (_, record) =>
  `${Number(record[key]).toFixed(2)}%`;

const columns: ColumnsType<any> = [
  {
    title: "Country",
    dataIndex: "country.name",
    render: (_, record) => record.country.name,
  },
  {
    title: "Before Covid-19",
    dataIndex: "before",
    showSorterTooltip: true,
    render: valueFormatter("before"),
    sorter: (a, b) => a.before - b.before,
  },
  {
    title: "After Covid-19",
    dataIndex: "after",
    showSorterTooltip: true,
    render: valueFormatter("after"),
    sorter: (a, b) => a.after - b.after,
  },
  {
    title: "Change %",
    dataIndex: "change",
    showSorterTooltip: true,
    render: valueFormatter("change"),
    sorter: (a, b) => a.change - b.change,
  },
];

const mergeMeasurements = (data: any) => {
  const { beforeCovid, afterCovid } = data;

  // merge the before and after covid values
  const datasource = beforeCovid.map((entry, index) => {
    const merged = Object.assign({}, entry, afterCovid[index], {
      change: beforeCovid[index].before,
    });

    merged.change = ((merged.after - merged.before) / merged.before) * 100;
    return merged;
  });

  return datasource;
};

const fetchMeasurement = async (measurement: string) => {
  const { data } = await Axios.post("/graphql", {
    query: query(measurement),
  });

  return mergeMeasurements(data.data);
};

export default (prop: HomePageProps) => {
  const [propState, updatePropState] = useState<HomePageProps>(prop);

  const [firstSource] = propState.datasource;

  const onVarSelected = async (e: RadioChangeEvent) => {
    const newMeasurement = e.target.value;

    updatePropState(
      Object.assign({}, propState, {
        measurement: newMeasurement,
        isLoading: true,
      })
    );

    const newDatasource = await fetchMeasurement(newMeasurement);

    updatePropState(
      Object.assign({}, propState, {
        measurement: newMeasurement,
        datasource: newDatasource,
        isLoading: false,
      })
    );
  };

  const radioOptions = VARIABLES.map((v) => {
    return { label: v, value: v };
  });

  return (
    <div>
      <h2>Covid Economics</h2>
      {firstSource && <h3>{firstSource.description}</h3>}
      <div>
        <Radio.Group
          options={radioOptions}
          onChange={onVarSelected}
          value={propState.measurement}
          optionType="button"
          buttonStyle="solid"
        ></Radio.Group>
      </div>

      <Table
        rowKey="id"
        dataSource={propState.datasource}
        columns={columns}
        pagination={false}
        loading={propState.isLoading}
      />
    </div>
  );
};

export const getStaticProps = async () => {
  const createSchema = require("../schema").default;
  const { graphql } = require("graphql");

  const schema = await createSchema();
  const measurement = "CBGDPR";

  const { data, errors } = await graphql({
    schema,
    source: query(measurement),
  });

  if (errors) {
    console.error(errors[0].stack);
    return { props: { datasource: [] } };
  }

  // merge the before and after covid values
  const datasource = mergeMeasurements(data);

  return { props: { datasource, measurement: measurement } };
};
