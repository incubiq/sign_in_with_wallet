
const getTheme = () => {
  return {
      name: "Cardano",
      symbol: "SIWC",
      dark_mode: false,
      background:  "/assets/images/siwc_background.jpg",
      logo: "/assets/images/www_logo.png",
      color: {
          text: "#333",
          button: "#003366",
          button_text: "#f0f0f0"
      }
  }
}

const getStyles = () => {
  const styleContainer = {}
  const styleColor = {}

  let theme=getTheme()
  if (theme && theme.background) {
      styleContainer.backgroundImage="url("+theme.background+")";
  }
  if (theme && theme.color.text) {
      styleColor.color=theme.color.text;
  }
  return {
      container: styleContainer,
      color: styleColor
  }
}

export {
  getTheme,
  getStyles
};
