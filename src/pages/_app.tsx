import { Layout } from "antd";
import "antd/dist/antd.css";
// import "antd/dist/antd.dark.css";

const { Header, Footer, Content } = Layout;

const AppPage = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Header>
        <div className="logo">Covid Eco</div>
      </Header>
      <Content>
        <Component {...pageProps} />
      </Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};

export default AppPage;
