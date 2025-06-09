
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { FaTelegramPlane, FaFacebookF, FaTwitter, FaTiktok, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer style={styles.footerContainer}>
      <div style={styles.column}>
        <h3 style={styles.header}>Security & Responsibility</h3>
        <p style={styles.text}>
          Betting is addictive and can be physiologically harmful. Fortune Sport Betting PLC is
          licensed and regulated by the National Lottery Administration of Ethiopia, license No: 66/2015.
          To be provided ...<a href="#" style={styles.link}>Read More</a>
        </p>
      </div>
      
      <div style={styles.column}>
        <h3 style={styles.header}>Games</h3>
        <ul style={styles.list}>
          <li>Horse Racing</li>
          <li>Football</li>
          <li>More...</li>
        </ul>
      </div>
      
      <div style={styles.column}>
        <h3 style={styles.header}>Contact</h3>
        <p style={styles.contactItem}><PhoneOutlined /> +251980209281</p>
        <p style={styles.contactItem}><MailOutlined /> customer@fortunebets.com</p>
        <p style={styles.contactItem}><EnvironmentOutlined /> Around Lem Hotel, Addis Ababa Ethiopia</p>
      </div>
      
      <div style={styles.column}>
        <h3 style={styles.header}>Social Media</h3>
        <div style={styles.socialMediaIcons}>
          <FaTelegramPlane style={styles.icon} />
          <FaFacebookF style={styles.icon} />
          <FaTwitter style={styles.icon} />
          <FaTiktok style={styles.icon} />
          <FaInstagram style={styles.icon} />
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footerContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "flex-start",
    backgroundColor: "#D3E3D3",
    padding: "2rem",
    // marginTop: "150px",
    gap: "1rem",
  },
  column: {
    flex: 1,
    minWidth: "200px",
    maxWidth: "250px",
    margin: "0 1rem",
  },
  header: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#1C6758",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "0.875rem",
    color: "#4A4A4A",
    lineHeight: "1.5",
  },
  link: {
    color: "#1C6758",
    textDecoration: "underline",
  },
  list: {
    listStyleType: "none",
    padding: 0,
    fontSize: "0.875rem",
    color: "#4A4A4A",
  },
  contactItem: {
    fontSize: "0.875rem",
    color: "#4A4A4A",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: "0.5rem 0",
  },
  socialMediaIcons: {
    display: "flex",
    gap: "1rem",
  },
  icon: {
    fontSize: "1.25rem",
    color: "#1C6758",
    cursor: "pointer",
  },
  // Responsive styles for smaller screens
  "@media (max-width: 768px)": {
    footerContainer: {
      flexDirection: "column",
      alignItems: "center",
      padding: "1rem",
    },
    column: {
      maxWidth: "100%",
      textAlign: "center",
      margin: "0.5rem 0",
    },
    socialMediaIcons: {
      justifyContent: "center",
    },
    header: {
      fontSize: "1.15rem",
    },
    text: {
      fontSize: "0.875rem",
    },
  },
};

export default Footer;
