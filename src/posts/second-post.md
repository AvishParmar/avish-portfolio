A few things that reduced iteration time and made results more reliable...

We minimize the loss:

$$
\mathcal{L}(\theta) = \sum_i (y_i - f_\theta(x_i))^2
$$

And update parameters using:

$$\theta \leftarrow \theta - \eta \nabla \mathcal{L}$$

![Training curve](/posts/second-post/training.gif)

<img src="/posts/second-post/model.gif" width="600" />

<video controls autoplay loop muted width="640">
  <source src="/posts/second-post/demo.mp4" type="video/mp4" />
</video>

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/2PuFyjAs7JA?si=Wnex9K-EPi3_O0HG"
  frameborder="0"
  allowfullscreen
></iframe>
