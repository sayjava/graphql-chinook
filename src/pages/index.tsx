import React from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

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
    description: string;
    time: string;
    country: {
      name: string;
      id: string;
    };
  }[];
  govtLending: any[];
}

export default ({ datasource }: HomePageProps) => {
  const valueFormatter = (key: string) => (_, record) =>
    `${Number(record[key]).toFixed(2)}%`;

  const columns: ColumnsType<any> = [
    {
      title: "Country",
      dataIndex: "country.name",
      key: "id",
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
  ];

  return (
    <div>
      <Table dataSource={datasource} columns={columns} pagination={false} />
    </div>
  );
};

export const getStaticProps = async () => {
  const createSchema = require("../schema").default;
  const { graphql } = require("graphql");

  const schema = await createSchema();

  const { data, errors } = await graphql({
    schema,
    source: query("NLGQ"),
  });

  if (errors) {
    console.error(errors[0].stack);
    return { props: { datasource: [] } };
  }

  const { beforeCovid, afterCovid } = data;

  // merge the before and after covid
  const datasource = beforeCovid.map((entry, index) => {
    return Object.assign({}, entry, afterCovid[index]);
  });

  return { props: { datasource } };
};
